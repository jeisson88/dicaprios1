import os
import numpy as np
from tqdm import tqdm # Para una barra de progreso amigable

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from productos.models import Producto


# Intentar importar TensorFlow y sus componentes. Manejar error si no está instalado.
try:
    import tensorflow as tf
    from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
    from tensorflow.keras.preprocessing import image as keras_image
    from tensorflow.keras.models import Model
except ImportError:
    raise CommandError(
        "TensorFlow no está instalado o no se pudo importar. "
        "Asegúrate de haberlo instalado en tu entorno virtual. "
        "Ejecuta: pip install tensorflow numpy scikit-learn"
    )

# Definir el tamaño de entrada esperado por el modelo ResNet50
IMG_WIDTH, IMG_HEIGHT = 224, 224

# Directorio donde se guardarán los embeddings y los IDs
# Se crea dentro de la carpeta 'media' para mantenerlo junto con otros archivos subidos,
# pero podría ser cualquier otra ubicación que decidas.
EMBEDDINGS_DIR = os.path.join(settings.MEDIA_ROOT, 'ia_embeddings')
EMBEDDINGS_FILE = os.path.join(EMBEDDINGS_DIR, 'product_embeddings.npy')
PRODUCT_IDS_FILE = os.path.join(EMBEDDINGS_DIR, 'product_ids.npy')

class Command(BaseCommand):
    help = 'Genera y guarda los embeddings de las imágenes de los productos utilizando ResNet50.'

    def _get_embedding(self, image_path, model):
        """
        Genera un embedding para una única imagen.
        """
        try:
            img = keras_image.load_img(image_path, target_size=(IMG_WIDTH, IMG_HEIGHT))
            img_array = keras_image.img_to_array(img)
            img_array_expanded = np.expand_dims(img_array, axis=0)
            img_preprocessed = preprocess_input(img_array_expanded) # Preprocesamiento específico de ResNet50
            
            embedding = model.predict(img_preprocessed, verbose=0) # verbose=0 para no mostrar barra de progreso de Keras por cada imagen
            return embedding.flatten() # Aplanar para obtener un vector 1D
        except Exception as e:
            self.stderr.write(f"Error procesando la imagen {image_path}: {e}")
            return None

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Iniciando la generación de embeddings de imágenes..."))

        # 1. Cargar el modelo ResNet50 pre-entrenado
        # Usamos include_top=False para quitar la capa de clasificación final.
        # pooling='avg' aplica Average Pooling global a la salida de la última capa convolucional.
        try:
            base_model = ResNet50(weights='imagenet', include_top=False, pooling='avg', input_shape=(IMG_WIDTH, IMG_HEIGHT, 3))
            # En algunos casos, si solo quieres las características de una capa específica, puedes hacer:
            # model = Model(inputs=base_model.input, outputs=base_model.output)
            # Para este caso, base_model.output ya es el vector de características deseado debido a pooling='avg'
            model = base_model 
            self.stdout.write(self.style.SUCCESS("Modelo ResNet50 cargado exitosamente."))
        except Exception as e:
            raise CommandError(f"Error al cargar el modelo ResNet50: {e}. Asegúrate de tener conexión a internet la primera vez para descargar los pesos.")

        # 2. Obtener todos los productos con imágenes
        # El modelo Producto tiene el campo 'imagen' y el nombre del producto es 'nombre_producto'
        # según tu `models.py` que me compartiste: `imagen = models.ImageField(upload_to='productos_imagenes/', blank=True, null=True)`
        productos_con_imagen = Producto.objects.filter(imagen__isnull=False).exclude(imagen__exact='')
        
        if not productos_con_imagen.exists():
            self.stdout.write(self.style.WARNING("No se encontraron productos con imágenes para procesar."))
            return

        self.stdout.write(f"Se encontraron {productos_con_imagen.count()} productos con imágenes.")

        all_embeddings = []
        product_ids = []
        processed_count = 0
        failed_count = 0

        # 3. Iterar sobre los productos y generar embeddings
        # Usar tqdm para una barra de progreso
        for producto in tqdm(productos_con_imagen, desc="Procesando imágenes"):
            if not producto.imagen or not producto.imagen.path:
                self.stderr.write(f"Producto ID {producto.id} ('{producto.nombre_producto}') no tiene una ruta de imagen válida. Saltando.")
                failed_count += 1
                continue

            image_full_path = producto.imagen.path
            
            if not os.path.exists(image_full_path):
                self.stderr.write(f"Imagen no encontrada en la ruta: {image_full_path} para el producto ID {producto.id}. Saltando.")
                failed_count += 1
                continue
            
            embedding = self._get_embedding(image_full_path, model)
            
            if embedding is not None:
                all_embeddings.append(embedding)
                product_ids.append(producto.id)
                processed_count += 1
            else:
                failed_count += 1
        
        if not all_embeddings:
            self.stdout.write(self.style.ERROR("No se pudo generar ningún embedding. Revisa los errores."))
            return

        # 4. Convertir a arrays NumPy
        all_embeddings_np = np.array(all_embeddings)
        product_ids_np = np.array(product_ids)

        # 5. Guardar los embeddings y los IDs
        # Asegurarse de que el directorio de embeddings exista
        os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
        
        try:
            np.save(EMBEDDINGS_FILE, all_embeddings_np)
            np.save(PRODUCT_IDS_FILE, product_ids_np)
            self.stdout.write(self.style.SUCCESS(f"Embeddings guardados en: {EMBEDDINGS_FILE}"))
            self.stdout.write(self.style.SUCCESS(f"IDs de productos guardados en: {PRODUCT_IDS_FILE}"))
        except Exception as e:
            raise CommandError(f"Error al guardar los archivos de embeddings/IDs: {e}")

        self.stdout.write(self.style.SUCCESS(f"Proceso completado. {processed_count} imágenes procesadas exitosamente, {failed_count} fallaron."))