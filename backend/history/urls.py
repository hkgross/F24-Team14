from django.urls import include, path
from .views import get_hist

urlpatterns = [
    path('', get_hist, name='get_hist'),
]