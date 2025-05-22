from rest_framework import serializers
from .models import Producto, Categoria, Proveedor # Asegúrate de importar Proveedor

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre_categoria') # Especifica campos para ser más explícito

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id', 'nombre_proveedor', 'contacto', 'telefono', 'direccion') # O __all__

class ProductoSerializer(serializers.ModelSerializer):
    # Para mostrar el nombre de la categoría en lugar del ID al leer (opcional)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    # Para enviar el ID de la categoría al crear/actualizar
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), 
        allow_null=True, # Si blank=True, null=True en el modelo
        required=False   # Si blank=True, null=True en el modelo
    )

    # --- NUEVA SECCIÓN PARA PROVEEDOR ---
    # Para mostrar el nombre del proveedor al leer (opcional)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre_proveedor', read_only=True, allow_null=True)
    # Para enviar el ID del proveedor al crear/actualizar
    proveedor = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.all(), 
        allow_null=True, # Coincide con null=True en el modelo
        required=False   # Coincide con blank=True en el modelo
    )
    # --- FIN NUEVA SECCIÓN ---

    class Meta:
        model = Producto
        fields = [
            'id', 
            'nombre_producto', 
            'precio', 
            'talla', 
            'color', 
            'stock', 
            'categoria',         # ID para escribir
            'categoria_nombre',  # Nombre para leer
            'proveedor',         # ID para escribir
            'proveedor_nombre'   # Nombre para leer
        ]
        # Si prefieres que el campo 'categoria' y 'proveedor' directamente
        # manejen tanto la representación de objeto (lectura) como el ID (escritura),
        # puedes usar la técnica de anidar el serializador para read_only=True
        # y PrimaryKeyRelatedField para write_only=True, o simplemente usar
        # StringRelatedField para lectura si el __str__ del modelo es suficiente.
        # Por simplicidad aquí, separamos los campos de lectura de nombre y escritura de ID.