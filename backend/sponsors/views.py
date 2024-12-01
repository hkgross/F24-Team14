from rest_framework import viewsets
from .serializers import SponsorsSerializer
from .models import Sponsors
from authentication.models import Account, Account_Sponsor, Sponsors
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import ValidationError
from rest_framework import status
from authentication.serializers import AccountSerializer, AccountSponsorSerializer


class SponsorsViewSet(viewsets.ModelViewSet):
    # Make query set
    queryset = Sponsors.objects.all()
    
    # Serializer
    serializer_class = SponsorsSerializer

    # Return most recent
    def get_queryset(self):
        return Sponsors.objects.order_by('SPONSOR_ID')

# Get all the drivers that belong to a sponsor
class MyDriversViewSet(APIView):
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

                # UPDATE THIS LATER WHEN DRIVERS HAVE MULTIPLE SPONSORS

                # Find the sponsor user's account
                sponsorUser = Account.objects.get(ACCOUNT_ID=userID)
                sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID=userID)
                
                # Get sponsor id of organization
                sponsorID = sponsorBridge.SPONSOR_ID
                
                
                # Search for all users who are drivers and match sponsor id
                driverids = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorID)
                acc_id_list = ()
                for acc in driverids:
                    acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                drivers = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                        ACCOUNT_TYPE='driver')
                # Serialize
                driverList = AccountSerializer(drivers, many=True)


                return Response(driverList.data, status=status.HTTP_200_OK)

            except TokenError:
                #print("token error")
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

# Get all members of a company (driver and sponsor users)
# Sponsor gets all members of company
# Admin gets everything
class MyCompanyViewSet(APIView):
    authentication_classes = []
    permission_classes = []

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

                # UPDATE THIS LATER WHEN DRIVERS HAVE MULTIPLE SPONSORS

                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)

                # Check query param
                queryName = request.data["Name"]
                queryAccountType = request.data["Type"]

                # Sponsor
                if (user.ACCOUNT_TYPE=='sponsor'):
                    # Get sponsor id of organization
                    sponsorID = user.ACC_SPONSOR_ID
                    # Search for all users match sponsor id
                    directory = Account.objects.filter(ACC_SPONSOR_ID=sponsorID)

                    # Filter name
                    if (queryName != ""):
                        try:
                            directory = directory.filter(NAME__contains=queryName)
                        except Account.DoesNotExist:
                            directory = None

                    # Filter type
                    if (queryAccountType != ""):
                        try:
                            directory = directory.filter(ACCOUNT_TYPE__contains=queryAccountType)
                        except Account.DoesNotExist:
                            directory = None   
                

                # Admin
                if (user.ACCOUNT_TYPE=='admin'):
                    # Return all
                    directory = Account.objects.all()

                    # Filter name
                    if (queryName != ""):
                        try:
                            directory = directory.filter(NAME__contains=queryName)
                        except Account.DoesNotExist:
                            directory = None

                    # Filter type
                    if (queryAccountType != ""):
                        try:
                            directory = directory.filter(ACCOUNT_TYPE__contains=queryAccountType)
                        except Account.DoesNotExist:
                            directory = None                
                
                # Serialize
                directoryList = AccountSerializer(directory, many=True)


                return Response(directoryList.data, status=status.HTTP_200_OK)

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)



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

                # UPDATE THIS LATER WHEN DRIVERS HAVE MULTIPLE SPONSORS

                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)

                # Sponsor
                if (user.ACCOUNT_TYPE=='sponsor'):
                    # Get sponsor id of organization
                    sponsorID = Account_Sponsor.objects.get(ACCOUNT_ID=user.ACCOUNT_ID).SPONSOR_ID
                    # Search for all users match sponsor id
                    acc_sponsors = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorID)
                    acc_id_list = ()
                    for acc in acc_sponsors:
                        acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)

                    directory = Account.objects.filter(ACCOUNT_ID__in=acc_id_list)
                

                # Admin
                if (user.ACCOUNT_TYPE=='admin'):
                    # Return all
                    directory = Account.objects.all()             
                
                # Serialize
                directoryList = AccountSerializer(directory, many=True)


                return Response(directoryList.data, status=status.HTTP_200_OK)

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)
    
class GetSponsors(APIView):
    def get(self, request):
        sponsors = Sponsors.objects.all()
        serializer = SponsorsSerializer(sponsors, many=True)
        return Response(serializer.data)


# Create new sponsor organization
class CreateSponsor(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        # Extract token
        if auth_header:

            token = auth_header.split('Bearer ')[1]

            try: 
                # Check token valid
                valid_token = UntypedToken(token)

                # Decode the token
                payload = valid_token.payload
                userID = payload.get('user_id')

                user = Account.objects.get(ACCOUNT_ID=userID)

                # Needs to be admin account
                if (user.ACCOUNT_TYPE=="admin"):

                    # Get data
                    name = request.data["Name"]
                    description = request.data["Description"]
                    value = request.data["Points"]

                    # Create new sponsor
                    sponsor = Sponsors(PT_VALUE = value,
                                        NAME = name,
                                        DESCRIPTION = description, 
                                        
                                        CAT_MEDIA_TYPE="all",
                                        CAT_EXPLICIT=0)

                    # Save new sponsor
                    sponsor.save()

                    return Response( 
                        {"Success": True}, status=status.HTTP_200_OK
                    )

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)



    

class GetAcceptedSponsors(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        account_id = request.query_params.get('account_id')

        if not account_id:
            return Response({"error": "ACCOUNT_ID is required."}, status=400)

        try:
            sponsors = Account_Sponsor.objects.filter(
                ACCOUNT_ID=account_id,
                STATUS=Account_Sponsor.STATUS_CHOICES.ACCEPTED
            ).select_related('SPONSOR_ID')

            sponsor_data = [
                {
                    "sponsor_name": sponsor.SPONSOR_ID.NAME,
                    "points": sponsor.NUM_POINTS,
                    "app_date": sponsor.APP_DATE,
                }
                for sponsor in sponsors
            ]

            return Response(sponsor_data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)