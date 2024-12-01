from rest_framework import serializers
from .models import About

class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = ('ABOUT_ID', 'PRODUCT_NAME', 'TEAM_NUM',
                    'VERSION_NUM', 'ABOUT_DESC', 'RELEASE_DATE')