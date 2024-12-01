from rest_framework import serializers
from .models import Audit

class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = ["EVENT_ID", "AUDIT_SPONSOR_ID", "AUDIT_ACCOUNT_ID", "EVENT_TYPE",
                    "DESCRIPTION", "EVENT_TIME"]