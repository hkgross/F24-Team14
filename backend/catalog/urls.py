from django.urls import include, path
from .views import product_page, get_all, update_prefs

urlpatterns = [
    path('<int:id>/', product_page, name='product_page'),
    path('', get_all, name='get_all'),
    path('prefs/<int:id>/', update_prefs, name='update_prefs')
]