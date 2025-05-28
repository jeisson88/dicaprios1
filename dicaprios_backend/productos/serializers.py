# dicaprios_backend/productos/serializers.py

from rest_framework import serializers
from .models import Producto, Categoria, Proveedor

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre_categoria')

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id', 'nombre_proveedor', 'contacto', 'telefono', 'direccion')

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True, allow_null=True)
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        allow_null=True,
        required=False
    )
    proveedor_nombre = serializers.CharField(source='proveedor.nombre_proveedor', read_only=True, allow_null=True)
    proveedor = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.all(),
        allow_null=True,
        required=False
    )
    
    # Para LEER la URL de la imagen
    imagen_url = serializers.SerializerMethodField()
    
    # Para ESCRIBIR (subir) el archivo de imagen.
    # Este campo se usará cuando se envíen datos al backend (POST, PUT, PATCH).
    # No se incluirá en la respuesta GET si 'imagen_url' ya está presente y este es write_only.
    imagen = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre_producto',
            'precio',
            'talla',
            'color',
            'stock',
            'categoria',
            'categoria_nombre',
            'proveedor',
            'proveedor_nombre',
            'imagen_url', # Para la lectura de la URL
            'imagen'      # Para la escritura/subida del archivo
        ]
        # Si quieres que 'imagen' nunca aparezca en la respuesta JSON (GET),
        # pero sí se use para subir, puedes mantenerlo como write_only=True
        # y quitarlo de 'fields' si solo quieres 'imagen_url' en la salida.
        # Sin embargo, tenerlo en 'fields' y marcado como write_only=True es claro.

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and hasattr(obj.imagen, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

    # No es necesario un método create o update personalizado aquí si
    # el ModelSerializer estándar maneja bien los campos, incluido el ImageField.
    # DRF tomará el archivo del campo 'imagen' (gracias a write_only=True)
    # y lo guardará en el modelo Producto.imagen.