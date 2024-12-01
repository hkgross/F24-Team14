from rest_framework import serializers
from .models import Account, Token, Account_Sponsor

from rest_framework_simplejwt.tokens import RefreshToken
class AccountSerializer(serializers.ModelSerializer):
    # Textchoices
    account_type_display = serializers.CharField(source="get_ACCOUNT_TYPE_display", read_only=True)
    account_status_display = serializers.CharField(source="get_STATUS_display", read_only=True)
    class Meta:
        model = Account
        fields = ["ACCOUNT_ID", "NAME", "ADDRESS", "CREATION_DATE", "account_status_display",
        "LAST_LOGIN", "account_type_display", "BIRTHDAY", "USERNAME", 
        "EMAIL", "BIO", "PASSWORD"]

# Use later for password reset
class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ["token", "created_at", "expires_at", "user_id", "is_used"]
        
# Customize jwt to work with fields in Account
class CustomTokenObtainPairSerializer:
    @classmethod
    def get_token(cls, user):
        token = RefreshToken.for_user(user)

        # Claims
        token['user_id'] = user.ACCOUNT_ID
        token['username'] = user.USERNAME
        token['type'] = user.ACCOUNT_TYPE

        return token
    
class AccountSponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account_Sponsor
        fields = [
            'ACC_SPONSOR_ID',
            'ACCOUNT_ID',
            'SPONSOR_ID',
            'NUM_POINTS',
            'STATUS',
            'HIRING_DESC',
            'REJECT_DESC',
        ]