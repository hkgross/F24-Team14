from rest_framework import viewsets
from authentication.serializers import AccountSerializer
from authentication.models import Account

class AccountsViewSet(viewsets.ModelViewSet):
    # Make query set
    queryset = Account.objects.all()
    
    # Serializer
    serializer_class = AccountSerializer

    # Return most recent
    def get_queryset(self):
        return Account.objects.order_by('ACCOUNT_ID')
