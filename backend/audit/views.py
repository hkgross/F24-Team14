from django.shortcuts import render
from rest_framework.views import APIView
from .models import Audit
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from authentication.models import Account, Account_Sponsor
from .serializers import AuditSerializer

class AuditLogView(APIView):
    authentication_classes = []
    permission_classes = []
    # Retrieve all audit entries
    # Admin wants all, sponsor wants specific sponsor 
    def get(self, request, format=None):
        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        # Extract token
        if auth_header:
            # Split bearer token to only get token
            token = auth_header.split('Bearer ')[1]           

            try:
                # Check if valid
                valid_token = UntypedToken(token)

                # Decode token
                payload = valid_token.payload
                userID = payload.get('user_id')

                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)

                # Sponsor
                if (user.ACCOUNT_TYPE=='sponsor'):
                    # Get sponsor id of organization
                    sponsorID = Account_Sponsor.objects.get(ACCOUNT_ID=user).SPONSOR_ID.SPONSOR_ID
                    # Search for all users match sponsor id
                    auditLog = Audit.objects.filter(AUDIT_SPONSOR_ID=sponsorID)

                # Admin
                if (user.ACCOUNT_TYPE=="admin"):
                    auditLog = Audit.objects.all()

                # serialize
                serializedLogs = AuditSerializer(auditLog, many=True)

                return Response(serializedLogs.data, status=status.HTTP_200_OK)

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

            # Missing token in header
            return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

    # Search audit log
    def post(self, request, format=None):
        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        # Extract token
        if auth_header:
            # Split bearer token to only get token
            token = auth_header.split('Bearer ')[1]           

            try:
                # Check if valid
                valid_token = UntypedToken(token)

                # Decode token
                payload = valid_token.payload
                userID = payload.get('user_id')


                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)

                # Sponsor
                if (user.ACCOUNT_TYPE == "sponsor"):
                    # Check query param
                    queryStartDate = request.data["Start"]
                    queryEndDate = request.data["End"]

                    # Get sponsor id of organization
                    sponsorID = user.ACC_SPONSOR_ID

                    # Search for all users match sponsor id
                    auditLog = Audit.objects.filter(AUDIT_SPONSOR_ID=sponsorID)

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            auditLog = auditLog.filter(EVENT_TIME__gte=queryStartDate)
                        except Audit.DoesNotExist:
                            auditLog = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            auditLog = auditLog.filter(EVENT_TIME__lte=queryEndDate)
                        except Audit.DoesNotExist:
                            auditLog = None  
                
                # Serialize
                auditLog = AuditSerializer(auditLog, many=True)

                return Response(auditLog.data, status=status.HTTP_200_OK)

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)


# Notifications for specific user
# Get specific event types from audit log for user sending request
class UserHistoryView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        # Extract token
        if auth_header:
            # Split bearer token to only get token
            token = auth_header.split('Bearer ')[1]           

            try:
                # Check if valid
                valid_token = UntypedToken(token)

                # Decode token
                payload = valid_token.payload
                userID = payload.get('user_id')

                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)
                userID = user.ACCOUNT_ID

                # Get entries in audit log that match that user
                entries = Audit.objects.filter(AUDIT_ACCOUNT_ID=userID, EVENT_TYPE__in=['Points Added', 'Account Update']).order_by('EVENT_TIME').values()

                # Serialize
                serializedEntries = AuditSerializer(entries, many=True)

                return Response (
                    serializedEntries.data, status=status.HTTP_200_OK
                )
            except TokenError:
                #print("token error")
                return Response({"valid": False}, status=status.HTTP_200_OK)

            # Missing token in header
            return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)
