from django.shortcuts import render

# Create your views here.
import os
import numpy as np
import tempfile # Para manejar archivos temporales de forma segura

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

# Importaciones de modelos y serializadores de la app 'productos'
from productos.models import Producto # Asegúrate que el nombre de tu modelo Producto es correcto
from productos.serializers import ProductoSerializer # Y que tu serializador es correcto

# Intentar importar TensorFlow y sus componentes.
try:
    
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    import tensorflow as tf
    from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
    from tensorflow.keras.preprocessing import image as keras_image
    # Model no es estrictamente necesario aquí si ResNet50(pooling='avg') ya da el vector
except ImportError:
    # Este error debería haberse manejado en la instalación, pero es bueno tener un fallback.
    # En un entorno de producción, el servidor podría no iniciar si esto falla.
    tf = None 
    ResNet50 = None
    preprocess_input = None
    keras_image = None
    # print("ADVERTENCIA: TensorFlow no está instalado. El Buscador Visual no funcionará.")

# Intentar importar scikit-learn para cosine_similarity
try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None
    # print("ADVERTENCIA: scikit-learn no está instalado. El Buscador Visual no funcionará.")


# --- Configuración de IA y Carga Perezosa ---
IMG_WIDTH, IMG_HEIGHT = 224, 224 # Tamaño de entrada para ResNet50

# Rutas a los archivos de embeddings (igual que en generate_image_embeddings.py)
EMBEDDINGS_DIR = os.path.join(settings.MEDIA_ROOT, 'ia_embeddings')
EMBEDDINGS_FILE = os.path.join(EMBEDDINGS_DIR, 'product_embeddings.npy')
PRODUCT_IDS_FILE = os.path.join(EMBEDDINGS_DIR, 'product_ids.npy')

# Variables globales para almacenar los componentes de IA cargados
RESNET_MODEL_INSTANCE = None
ALL_PRODUCT_EMBEDDINGS = None
ALL_PRODUCT_IDS = None
IA_COMPONENTS_LOADED = False
IA_LOAD_ERROR = None # Para almacenar cualquier error durante la carga

SIMILARITY_THRESHOLD = 0.70 # Umbral de similitud (ajustar según pruebas)

def _load_ia_components():
    """
    Carga perezosamente el modelo ResNet50 y los embeddings de productos.
    Se llama una vez por proceso de Django.
    """
    global RESNET_MODEL_INSTANCE, ALL_PRODUCT_EMBEDDINGS, ALL_PRODUCT_IDS, IA_COMPONENTS_LOADED, IA_LOAD_ERROR

    if IA_COMPONENTS_LOADED:
        return IA_LOAD_ERROR is None # Devuelve True si se cargó sin error, False si hubo error previo

    if tf is None or ResNet50 is None or preprocess_input is None or keras_image is None or cosine_similarity is None:
        IA_LOAD_ERROR = "Dependencias críticas de IA (TensorFlow, scikit-learn) no están disponibles."
        IA_COMPONENTS_LOADED = True # Marcamos como 'cargado' para no reintentar y fallar repetidamente
        print(f"ERROR AL CARGAR COMPONENTES IA: {IA_LOAD_ERROR}")
        return False

    try:
        # 1. Cargar modelo ResNet50
        RESNET_MODEL_INSTANCE = ResNet50(weights='imagenet', include_top=False, pooling='avg', input_shape=(IMG_WIDTH, IMG_HEIGHT, 3))
        print("Modelo ResNet50 cargado para búsqueda visual.")

        # 2. Cargar embeddings y IDs de productos
        if not os.path.exists(EMBEDDINGS_FILE) or not os.path.exists(PRODUCT_IDS_FILE):
            IA_LOAD_ERROR = f"Archivos de embeddings ({EMBEDDINGS_FILE}) o IDs ({PRODUCT_IDS_FILE}) no encontrados. Ejecuta el comando 'generate_image_embeddings'."
            print(f"ERROR AL CARGAR COMPONENTES IA: {IA_LOAD_ERROR}")
            IA_COMPONENTS_LOADED = True 
            return False

        ALL_PRODUCT_EMBEDDINGS = np.load(EMBEDDINGS_FILE)
        ALL_PRODUCT_IDS = np.load(PRODUCT_IDS_FILE)
        print(f"Embeddings de productos ({ALL_PRODUCT_EMBEDDINGS.shape[0]}) cargados para búsqueda visual.")
        
        IA_COMPONENTS_LOADED = True
        IA_LOAD_ERROR = None # No hubo error
        return True
    except Exception as e:
        IA_LOAD_ERROR = f"Excepción al cargar componentes de IA: {e}"
        print(f"ERROR AL CARGAR COMPONENTES IA: {IA_LOAD_ERROR}")
        RESNET_MODEL_INSTANCE = None # Asegurar que no se usen si la carga falló
        ALL_PRODUCT_EMBEDDINGS = None
        ALL_PRODUCT_IDS = None
        IA_COMPONENTS_LOADED = True # Marcamos como 'cargado' para no reintentar y fallar repetidamente
        return False

def _get_embedding_for_query(image_file_obj, model):
    """
    Genera un embedding para una imagen de consulta (objeto archivo).
    Guarda temporalmente el archivo para procesarlo.
    """
    if model is None or keras_image is None or preprocess_input is None:
        print("Error: Modelo ResNet50 o componentes de Keras no disponibles para generar embedding.")
        return None
        
    try:
        # Crear un archivo temporal para guardar la imagen subida
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            for chunk in image_file_obj.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        img = keras_image.load_img(tmp_file_path, target_size=(IMG_WIDTH, IMG_HEIGHT))
        img_array = keras_image.img_to_array(img)
        img_array_expanded = np.expand_dims(img_array, axis=0)
        img_preprocessed = preprocess_input(img_array_expanded)
        embedding = model.predict(img_preprocessed, verbose=0)
        return embedding.flatten()
    except Exception as e:
        print(f"Error generando embedding para imagen de consulta: {e}")
        return None
    finally:
        # Asegurarse de borrar el archivo temporal
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)


class VisualSearchAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser) # Para manejar subida de archivos

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Intentar cargar los componentes de IA al instanciar la vista la primera vez o cuando el servidor inicie
        # y la vista sea importada.
        # Una mejor práctica para producción sería usar el método ready() de AppConfig.
        if not IA_COMPONENTS_LOADED:
            _load_ia_components()

    def post(self, request, *args, **kwargs):
        if IA_LOAD_ERROR: # Si hubo un error al cargar los componentes de IA
            return Response(
                {"error": f"El servicio de búsqueda visual no está disponible debido a un error interno: {IA_LOAD_ERROR}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        if RESNET_MODEL_INSTANCE is None or ALL_PRODUCT_EMBEDDINGS is None or ALL_PRODUCT_IDS is None or cosine_similarity is None:
            # Esto es una doble verificación o si _load_ia_components no se llamó correctamente
            return Response(
                {"error": "Componentes de IA no inicializados correctamente. Contacte al administrador."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        image_file = request.data.get('image') # 'image' es el nombre del campo en FormData

        if not image_file:
            return Response({"error": "No se proporcionó ninguna imagen."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Generar embedding para la imagen de consulta
        query_embedding = _get_embedding_for_query(image_file, RESNET_MODEL_INSTANCE)

        if query_embedding is None:
            return Response({"error": "No se pudo procesar la imagen subida."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Calcular similitudes
        # query_embedding es (D,), ALL_PRODUCT_EMBEDDINGS es (N, D). Reshape query_embedding a (1, D)
        similarities = cosine_similarity(query_embedding.reshape(1, -1), ALL_PRODUCT_EMBEDDINGS)
        
        # Similarities es un array de forma (1, N), queremos el array de N similitudes
        product_similarities = similarities[0]

        # 3. Encontrar la mejor coincidencia
        best_match_index = np.argmax(product_similarities)
        best_similarity_score = product_similarities[best_match_index]

        if best_similarity_score >= SIMILARITY_THRESHOLD:
            matched_product_id = ALL_PRODUCT_IDS[best_match_index]
            try:
                producto_encontrado = Producto.objects.get(id=matched_product_id)
                serializer = ProductoSerializer(producto_encontrado, context={'request': request})
                return Response({
                    "match_found": True,
                    "product": serializer.data,
                    "similarity_score": float(best_similarity_score) # Convertir a float nativo de Python
                }, status=status.HTTP_200_OK)
            except Producto.DoesNotExist:
                # Esto no debería pasar si los IDs en product_ids.npy son correctos y los productos existen
                return Response({
                    "match_found": False, 
                    "message": "Producto coincidente encontrado por IA pero no existe en la base de datos."
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({
                "match_found": False,
                "message": f"No se encontró ningún producto suficientemente similar. Mejor similitud: {best_similarity_score:.2f}",
                "best_similarity_score": float(best_similarity_score)
            }, status=status.HTTP_200_OK)