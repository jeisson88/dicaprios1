from rest_framework import serializers
from .models import Pedido, DetallePedido, Factura, DetalleFactrua

class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'fecha', 'estado']

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ['id', 'pedido', 'producto', 'cantidad', 'precio_unitario', 'subtotal']

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = ['id', 'cliente', 'pedido', 'fecha_emision', 'total']

class DetalleFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleFactrua
        fields = ['id', 'factura', 'producto', 'cantidad', 'precio_unitario', 'subtotal']
