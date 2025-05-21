from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Pedido
from .models import DetallePedido
from .models import Factura
from .models import DetalleFactrua
from productos.models import Producto
from .serializers import PedidoSerializer
from .serializers import DetallePedidoSerializer
from .serializers import FacturaSerializer
from .serializers import DetalleFacturaSerializer
from .filters import DetallePedidoFilter

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cliente', 'fecha', 'estado']
    

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
    queryset = DetalleFactrua.objects.all()
    serializer_class = DetalleFacturaSerializer
