# dicaprios_backend/visual_searcher/urls.py

from django.urls import path
from .views import VisualSearchAPIView # Importa la vista que creaste

urlpatterns = [
    path('search/', VisualSearchAPIView.as_view(), name='visual_image_search'),
    # Puedes añadir más URLs específicas para esta app aquí en el futuro si es necesario
]