from rest_framework import viewsets
from .serializers import AboutSerializer
from .models import About

class AboutViewSet(viewsets.ModelViewSet):
    # Make query set
    queryset = About.objects.all()
    
    # Serializer
    serializer_class = AboutSerializer

    # Return most recent
    def get_queryset(self):
        return About.objects.order_by('-RELEASE_DATE')[:1]