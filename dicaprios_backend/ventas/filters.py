import django_filters
from .models import DetallePedido

class DetallePedidoFilter(django_filters.FilterSet):
    pedido = django_filters.NumberFilter(field_name='pedido_id') 

    class Meta:
        model = DetallePedido
        fields = ['id', 'pedido']  # Campos por los que se puede filtrar