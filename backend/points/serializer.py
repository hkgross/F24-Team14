from rest_framework import serializers
from .models import Points
from authentication.models import Account_Sponsor

class PointsSerializer(serializers.ModelSerializer):
    HIST_ACC_SPONSOR_ID = serializers.PrimaryKeyRelatedField(queryset=Account_Sponsor.objects.all())
    class Meta:
        model = Points
        fields = ["HISTORY_ID", "POINT_CHANGE", "POINT_CHANGE_DATE", "STATUS", "ITEM_ID", "HIST_ACC_SPONSOR_ID", 
                    "SOURCE", "REASON", "SPONSOR_USER_ID"]