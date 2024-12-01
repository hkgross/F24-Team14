from rest_framework import serializers
from .models import Sponsors

class SponsorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsors
        fields = ['SPONSOR_ID', 'PT_VALUE', 'NAME', 'DESCRIPTION', 'CREATION_DATE', 'CAT_MEDIA_TYPE', 'CAT_EXPLICIT']