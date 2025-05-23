from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pedido
from .models import DetallePedido
from .models import Factura
from .models import DetalleFactura
from productos.models import Producto
from .serializers import PedidoSerializer
from .serializers import DetallePedidoSerializer
from .serializers import FacturaSerializer
from .serializers import DetalleFacturaSerializer
from .filters import DetallePedidoFilter
from rest_framework.decorators import action
from django.db import transaction

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cliente', 'fecha', 'estado']

    @action(detail=True, methods=['post'], url_path='generar-factura')
    @transaction.atomic # Para asegurar que todas las operaciones de BD se completen o ninguna
    def generar_factura(self, request, pk=None):
        pedido = self.get_object()

        # 1. Verificar si el pedido ya tiene una factura
        if Factura.objects.filter(pedido=pedido).exists():
            return Response(
                {"error": "Este pedido ya ha sido facturado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. (Opcional) Verificar el estado del pedido antes de facturar
        # if pedido.estado != Pedido.ESTADO_PENDIENTE: # O el estado que consideres facturable
        #     return Response(
        #         {"error": f"Solo los pedidos en estado '{Pedido.ESTADO_PENDIENTE}' pueden ser facturados."},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

        # 3. Crear la Factura
        total_factura = 0
        detalles_pedido = pedido.detalles.all()

        if not detalles_pedido.exists():
            return Response(
                {"error": "El pedido no tiene detalles y no se puede facturar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calcular el total basado en los detalles del pedido
        for detalle_ped in detalles_pedido:
            total_factura += detalle_ped.subtotal

        factura = Factura.objects.create(
            cliente=pedido.cliente,
            pedido=pedido,
            fecha_emision=timezone.now(), # Usar timezone.now() para la fecha actual con zona horaria
            total=total_factura 
        )

        # 4. Crear los DetalleFactura a partir de los DetallePedido
        for detalle_ped in detalles_pedido:
            DetalleFactura.objects.create( # Corregido: DetalleFactura en lugar de DetalleFactrua
                factura=factura,
                producto=detalle_ped.producto,
                cantidad=detalle_ped.cantidad,
                precio_unitario=detalle_ped.precio_unitario,
                subtotal=detalle_ped.subtotal
            )

        # 5. (Opcional pero Recomendado) Actualizar el estado del pedido a "Facturado"
        pedido.estado = Pedido.ESTADO_FACTURADO 
        pedido.save()

        # 6. Serializar y devolver la factura creada
        factura_serializer = FacturaSerializer(factura) # Asegúrate de tener este serializador
        return Response(factura_serializer.data, status=status.HTTP_201_CREATED)

# Asegúrate de que FacturaSerializer exista y funcione correctamente
# Si no lo tienes, un ejemplo básico:
# class FacturaSerializer(serializers.ModelSerializer):
#     detalles = DetalleFacturaSerializer(many=True, read_only=True) # Para ver detalles en la respuesta
#     cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
#
#     class Meta:
#         model = Factura
#         fields = ['id', 'cliente', 'cliente_nombre', 'pedido', 'fecha_emision', 'total', 'detalles']
#         read_only_fields = ['fecha_emision', 'total', 'detalles'] # Campos que se calculan o se establecen automáticamente


    

class DetallePedidoViewSet(viewsets.ModelViewSet):
    queryset = DetallePedido.objects.all()
    serializer_class = DetallePedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DetallePedidoFilter

    def create(self, request, *args, **kwargs):
        try:
            detalle_pedido_data = request.data
            producto_id = detalle_pedido_data.get('producto')
            cantidad = int(detalle_pedido_data.get('cantidad'))

            # Verificar y actualizar stock de cada producto
            producto = Producto.objects.get(id=producto_id)
            if producto.stock < cantidad:
                return Response({"error": "Stock insuficiente para el producto seleccionado."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Actualizar el stock del producto
            producto.stock -= cantidad
            producto.save()

            return super().create(request, *args, **kwargs)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer

class DetalleFacturaViewSet(viewsets.ModelViewSet):
    queryset = DetalleFactura.objects.all()
    serializer_class = DetalleFacturaSerializer
