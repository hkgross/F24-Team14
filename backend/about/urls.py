from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# Router path
router.register(r'about', AboutViewSet, basename='about')

# URL path for rest_framework
urlpatterns = [
    path('', include(router.urls)),
]
