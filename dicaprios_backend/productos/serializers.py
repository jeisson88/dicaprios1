from rest_framework import serializers
from .models import Producto, Proveedor, Categoria

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre_producto', 'precio', 'talla', 'color', 'stock', 'categoria']

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre_proveedor', 'contacto', 'telefono', 'direccion']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre_categoria']
