from rest_framework import viewsets
from .models import Producto, Categoria, Proveedor # Importar Proveedor
from .serializers import ProductoSerializer, CategoriaSerializer, ProveedorSerializer # Importar ProveedorSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

# --- NUEVO O ASEGURAR QUE EXISTE ---
class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
# --- FIN NUEVO ---