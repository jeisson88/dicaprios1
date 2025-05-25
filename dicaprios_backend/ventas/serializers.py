from rest_framework import serializers
from .models import Pedido, DetallePedido, Factura, DetalleFactura, Cliente, Producto

class PedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'fecha', 'estado']

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ['id', 'pedido', 'producto', 'cantidad', 'precio_unitario', 'subtotal']

class DetalleFacturaSerializer(serializers.ModelSerializer): # Corregido: DetalleFactura
    producto_nombre = serializers.CharField(source='producto.nombre_producto', read_only=True)

    class Meta:
        model = DetalleFactura # Corregido: DetalleFactura
        fields = ['id', 'factura', 'producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']
        # 'factura' podría ser read_only si siempre se crea a través de la factura padre

class FacturaSerializer(serializers.ModelSerializer):
    detalles = DetalleFacturaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True) # Asumiendo 'nombre_completo' en Cliente, o ajusta
    pedido_id = serializers.IntegerField(source='pedido.id', read_only=True)

    class Meta:
        model = Factura
        fields = ['id', 'cliente', 'cliente_nombre', 'pedido_id', 'fecha_emision', 'total', 'detalles']
        # Campos como fecha_emision, total, detalles usualmente son read_only al crear/actualizar la factura directamente
        # ya que se calculan o establecen por la lógica de negocio (como la acción generar_factura).

