from django.shortcuts import render
from rest_framework.views import APIView
from .models import Points
from authentication.models import Account, Account_Sponsor
from rest_framework.response import Response
from audit.models import Audit
from sponsors.models import Sponsors
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from .serializer import PointsSerializer
from collections import defaultdict

# Get or Update points for specific driver
class PointsView(APIView):
    authentication_classes = []
    permission_classes = []

    # Get points history for a specific driver
    def get(self, request, format=None):
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
                driverID = payload.get('user_id')

                user = Account.objects.get(ACCOUNT_ID=driverID)

                # Driver
                if (user.ACCOUNT_TYPE=="driver"):
                    user_acc_sponsor = Account_Sponsor.objects.filter(ACCOUNT_ID=user)
                    acc_sponsor_id_list = []
                    for acc in user_acc_sponsor:
                        acc_sponsor_id_list.append(acc.ACC_SPONSOR_ID)
                    user_acc_sponsor = Account_Sponsor.objects.filter(ACCOUNT_ID=user)
                    # acc_id_list = ()
                    # for acc in user_acc_sponsor:
                    #     acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                    # Get all point change history that matches driver's user ID
                    try:
                        pointHistory = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=user_acc_sponsor)

                        # Track sum of driver points for each sponsor
                        pointsTotal = defaultdict(int)
                        #fix for points total to just grab from acc_sponsor table
                        for sponsor in user_acc_sponsor:
                            pointsTotal[sponsor.SPONSOR_ID.NAME] = sponsor.NUM_POINTS
                        # for point in pointHistory:
                        #     sponsorName = point.HIST_ACC_SPONSOR_ID.SPONSOR_ID.NAME
                            

                        # Serialize
                        serializedHistory = PointsSerializer(pointHistory, many=True)

                        # # Get current total points of driver
                        # #Nick - NEED TO FIX FOR MULTIPLE SPONSORS
                        # currentPoints = user_acc_sponsor[0].NUM_POINTS

                        # # Return history and current total
                        # return Response(
                        #     {
                        #         "points": currentPoints,
                        #         "history": serializedHistory.data
                        #     }, status=status.HTTP_200_OK
                        # )
                        
                        # Return history and current total
                        return Response(
                            {
                                "total": pointsTotal, 
                                "history": serializedHistory.data
                            }, status=status.HTTP_200_OK
                        )
                    except Points.DoesNotExist:
                        return Response(
                            {
                                "points": "0",
                            }, status=status.HTTP_200_OK
                        )
                
                # Sponsor
                if (user.ACCOUNT_TYPE=="sponsor"):
                    #get bridge acc so i can get sponsor id
                    sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorInstance)
                    # acc_id_list = ()
                    # for acc in driverids:
                    #     acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                    # Search for all driver IDs that belong to sponsor
                    # driverIDs = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                    #         ACCOUNT_TYPE='driver').values_list('ACCOUNT_ID', flat=True)

                    # Filter entries that match driver IDs
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids)

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACCOUNT_ID.ACCOUNT_ID).NAME
                        # driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACC_SPONSOR_ID.ACCOUNT_ID).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)
                    

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )
                if (user.ACCOUNT_TYPE=="admin"):
                    # Get sponsor id of organization
                    # sponsorID = user.ACC_SPONSOR_ID
                    #get bridge acc so i can get sponsor id
                    # sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    # sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.all()
                    # acc_id_list = ()
                    # for acc in driverids:
                    #     acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                    # Search for all driver IDs that belong to sponsor
                    # driverIDs = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                    #         ACCOUNT_TYPE='driver').values_list('ACCOUNT_ID', flat=True)

                    # Filter entries that match driver IDs
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids)

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACCOUNT_ID.ACCOUNT_ID).NAME
                        # driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACC_SPONSOR_ID.ACCOUNT_ID).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)
                    

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )
                if (user.ACCOUNT_TYPE=="admin"):
                    # Get sponsor id of organization
                    # sponsorID = user.ACC_SPONSOR_ID
                    #get bridge acc so i can get sponsor id
                    # sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    # sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.all()
                    # acc_id_list = ()
                    # for acc in driverids:
                    #     acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                    # Search for all driver IDs that belong to sponsor
                    # driverIDs = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                    #         ACCOUNT_TYPE='driver').values_list('ACCOUNT_ID', flat=True)

                    # Filter entries that match driver IDs
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids)

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACCOUNT_ID.ACCOUNT_ID).NAME
                        # driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACC_SPONSOR_ID.ACCOUNT_ID).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)
                    

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )
                if (user.ACCOUNT_TYPE=="admin"):
                    # Get sponsor id of organization
                    # sponsorID = user.ACC_SPONSOR_ID
                    #get bridge acc so i can get sponsor id
                    # sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    # sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.all()
                    # acc_id_list = ()
                    # for acc in driverids:
                    #     acc_id_list += (acc.ACCOUNT_ID.ACCOUNT_ID,)
                    # Search for all driver IDs that belong to sponsor
                    # driverIDs = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                    #         ACCOUNT_TYPE='driver').values_list('ACCOUNT_ID', flat=True)

                    # Filter entries that match driver IDs
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids)

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:
                        try:
                            # Get name
                            sponsorName = Account_Sponsor.objects.get(ACC_SPONSOR_ID=entry["HIST_ACC_SPONSOR_ID"]).SPONSOR_ID.NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACCOUNT_ID.ACCOUNT_ID).NAME
                        # driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID'])[0].ACC_SPONSOR_ID.ACCOUNT_ID)
                        # driverName = driverBridgeID.NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)
                    

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)


    # Update points
    def post(self, request, format=None):
        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        token = auth_header.split('Bearer ')[1]

        # Check token valid
        valid_token = UntypedToken(token)

        # Decode the token
        payload = valid_token.payload
        sponsorUser = payload.get('user_id')

        # Get account of sponsor
        sponsorUserInstance = Account.objects.get(ACCOUNT_ID=sponsorUser)

        #get bridge acc so i can get sponsor id
        sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = sponsorUser)

        # Get user
        userID = request.data["user"]
        userInstance = Account.objects.get(ACCOUNT_ID=userID)
        accSponsorInstance = Account_Sponsor.objects.get(ACCOUNT_ID=userInstance, SPONSOR_ID=sponsorBridge.SPONSOR_ID)
        # Get point change
        pointChange = request.data["points"]
        # Get reason
        changeReason = request.data["reason"]

        # Create new point history entry
        entry = Points(POINT_CHANGE=pointChange,
                        STATUS=Points.Status.COMPLETED,
                        HIST_ACC_SPONSOR_ID=accSponsorInstance,
                        SOURCE=Points.Source.SPONSOR,
                        REASON=changeReason,
                        SPONSOR_USER_ID=sponsorUserInstance
                        )

        # Save new entry
        entry.save()

        # Update points field in for user in Account table
        pointsUpdate = accSponsorInstance.NUM_POINTS + int(pointChange)
        accSponsorInstance.NUM_POINTS = pointsUpdate
        accSponsorInstance.save()

        # Update audit log

        # Get sponsor ID from bridge table
        sponsorID = sponsorBridge.SPONSOR_ID.SPONSOR_ID

        # Get sponsor instance
        sponsorInstance = Sponsors.objects.get(SPONSOR_ID=sponsorID)

        # Create entry
        audit = Audit(AUDIT_SPONSOR_ID=sponsorInstance,
                        AUDIT_ACCOUNT_ID=userInstance,
                        EVENT_TYPE="Points Added",
                        DESCRIPTION=f"User {sponsorUserInstance.NAME} ID: {sponsorUserInstance.ACCOUNT_ID} added {pointChange} points to {userInstance.NAME} ID: {userInstance.ACCOUNT_ID} because {changeReason}")

        # Save entry
        audit.save()
        
        return Response(
            {
                "entry_id": entry.HISTORY_ID
            }
        )

# Search for specific points history 
class PointsSearchView(APIView):
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

                # Get user
                user = Account.objects.get(ACCOUNT_ID=userID)

                # Check query param
                queryName = request.data["Name"]
                queryStartDate = request.data["Start"]
                queryEndDate = request.data["End"]

                # Get sponsor id of organization
                if user.ACCOUNT_TYPE == 'sponsor':
                    bridgeid= Account_Sponsor.objects.get(ACCOUNT_ID=user)
                    sponsorID = bridgeid.SPONSOR_ID
                    user_acc_sponsor = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorID)
                    acc_id_list = []
                    for acc in user_acc_sponsor:
                        acc_id_list.append(acc.ACCOUNT_ID.ACCOUNT_ID)

                    # Search for all driver IDs that belong to sponsor
                    driverIDs = Account.objects.filter(ACCOUNT_ID__in=acc_id_list, 
                            ACCOUNT_TYPE='driver').values_list('ACCOUNT_ID', flat=True)

                    # Filter entries that match driver IDs
                    history = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=acc_id_list)
                
                    # Filter name
                    if (queryName != ""):
                        try:
                            driver = Account.objects.get(NAME__contains=queryName)
                            history = history.filter(HIST_ACC_SPONSOR_ID=Account_Sponsor.objects.get(ACCOUNT_ID=driver, SPONSOR_ID=sponsorID))
                        except Account.DoesNotExist:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except Points.DoesNotExist:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except Points.DoesNotExist:
                            history = None  
                    
                    # Serialize
                    historyList = PointsSerializer(history, many=True)

                    # Include names
                    listWithNames = []
                    for entry in historyList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        
                        driverName = Account.objects.get(ACCOUNT_ID=entry['HIST_ACCOUNT_ID']).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)


                    return Response(listWithNames, status=status.HTTP_200_OK)
                elif user.ACCOUNT_TYPE == 'admin':
                    # Filter entries that match driver IDs
                    history = Points.objects.all()
                
                    # Filter name
                    if (queryName != ""):
                        try:
                            driver = Account.objects.get(NAME__contains=queryName)
                            history = history.filter(HIST_ACC_SPONSOR_ID=Account_Sponsor.objects.get(ACCOUNT_ID=driver))
                        except Account.DoesNotExist:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except Points.DoesNotExist:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except Points.DoesNotExist:
                            history = None  
                    
                    # Serialize
                    historyList = PointsSerializer(history, many=True)

                    # Include names
                    listWithNames = []
                    for entry in historyList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.get(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID']).ACCOUNT_ID.ACCOUNT_ID).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)


                    return Response(listWithNames, status=status.HTTP_200_OK)
                elif user.ACCOUNT_TYPE == 'admin':
                    # Filter entries that match driver IDs
                    history = Points.objects.all()
                
                    # Filter name
                    if (queryName != ""):
                        try:
                            driver = Account.objects.get(NAME__contains=queryName)
                            history = history.filter(HIST_ACC_SPONSOR_ID=Account_Sponsor.objects.get(ACCOUNT_ID=driver))
                        except Account.DoesNotExist:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except Points.DoesNotExist:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except Points.DoesNotExist:
                            history = None  
                    
                    # Serialize
                    historyList = PointsSerializer(history, many=True)

                    # Include names
                    listWithNames = []
                    for entry in historyList.data:
                        try:
                            # Get name
                            sponsorName = Account.objects.get(ACCOUNT_ID=entry['SPONSOR_USER_ID']).NAME
                        except Account.DoesNotExist:
                            sponsorName = None
                            
                        # Append
                        entry['SPONSOR_NAME'] = sponsorName
                        
                        driverName = Account.objects.get(ACCOUNT_ID=Account_Sponsor.objects.get(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID']).ACCOUNT_ID.ACCOUNT_ID).NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)


                    return Response(listWithNames, status=status.HTTP_200_OK)

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

class SalesView(APIView):
    authentication_classes = []
    permission_classes = []

    # Get sale history
    def get(self, request, format=None):
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

                # Sponsor
                if (user.ACCOUNT_TYPE=="sponsor"):
                    #get bridge acc so i can get sponsor id
                    sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorInstance)

                    # Filter entries that match driver IDs and are sales
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids, SOURCE="ORDER")

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:                            
                        # Append                       
                        driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID']).first().ACCOUNT_ID
                        driverName = driverBridgeID.NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )


            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)
    

class SalesBySponsor(APIView):
    authentication_classes = []
    permission_classes = []

    # Get sale history
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
                querySponsor = request.data["Sponsor"]
                queryStartDate = request.data["Start"]
                queryEndDate = request.data["End"]
                queryType = request.data["Type"]

                # only admins can use this
                if (user.ACCOUNT_TYPE=="admin"):
                    history = Points.objects.filter(SOURCE='ORDER')
                    sponsorList = Sponsors.objects.all()
                    if (querySponsor != ""):
                        try:
                            sponsor = Sponsors.objects.filter(SPONSOR_ID=querySponsor)
                            sponsorList= sponsor
                            history = history.filter(HIST_ACC_SPONSOR_ID=Account_Sponsor.objects.filter(SPONSOR_ID=sponsor))
                        except:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except:
                            history = None
                    
                    # Serialize
                    # Summary
                    if (queryType == "summary"):
                        salesList = []
                        for sponsor in sponsorList:
                            sponsorfeetotal= 0
                            if history != None:
                                for transaction in history.filter(HIST_ACC_SPONSOR_ID__in=Account_Sponsor.objects.filter(SPONSOR_ID=sponsor)):
                                    #we get 1% cut
                                    sponsorfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE
                                entry = {}
                                entry['ID'] = sponsor.SPONSOR_ID
                                entry['NAME'] = sponsor.NAME
                                entry['START_DATE'] = queryStartDate
                                entry['END_DATE'] = queryEndDate
                                entry['TOTAL_SALES'] = sponsorfeetotal
                                salesList.append(entry)
                    
                    # Detail
                    else:
                        salesList = []
                        if history != None:
                            for transaction in history:
                                sponsorfeetotal= 0
                                #we get 1% cut
                                sponsor = transaction.HIST_ACC_SPONSOR_ID.SPONSOR_ID
                                sponsorfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE
                                entry = {}
                                entry['ID'] = transaction.HISTORY_ID
                                entry['NAME'] = sponsor.NAME
                                entry['DRIVER_NAME'] = transaction.HIST_ACC_SPONSOR_ID.ACCOUNT_ID.NAME
                                entry['DRIVER_ID'] = transaction.HIST_ACC_SPONSOR_ID.ACCOUNT_ID.ACCOUNT_ID
                                entry['START_DATE'] = queryStartDate
                                entry['END_DATE'] = queryEndDate
                                entry['TOTAL_SALES'] = sponsorfeetotal
                                salesList.append(entry)

                    return Response (
                        salesList, status=status.HTTP_200_OK
                    )


            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)
    
class SalesByDriver(APIView):
    authentication_classes = []
    permission_classes = []

    # Get sale history
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

                # Check query param
                queryName = request.data["Name"]
                queryStartDate = request.data["Start"]
                queryEndDate = request.data["End"]
                querySponsor = request.data["Sponsor"]
                queryType = request.data["Type"]

                # Admin
                if (user.ACCOUNT_TYPE=="admin"):
                    # Get all orders
                    history = Points.objects.filter(SOURCE='ORDER')
                    # Get list of all drivers
                    driverAccounts = Account.objects.filter(ACCOUNT_TYPE="driver")
                    # Get list of drivers from bridge
                    driverBridge = Account_Sponsor.objects.filter(ACCOUNT_ID__in=driverAccounts)

                    # Filter driver
                    if (queryName != ""):
                        try:
                            driver = Account.objects.get(NAME__contains=queryName)
                            accountIDS = Account_Sponsor.objects.filter(ACCOUNT_ID=driver)
                            history = history.filter(HIST_ACC_SPONSOR_ID__in=accountIDS)
                            driverBridge = driverBridge.filter(ACC_SPONSOR_ID__in=accountIDS)
                        except Account.DoesNotExist:
                            history = None

                    # Filter sponsor
                    if (querySponsor != ""):
                        try:
                            driverBridge = driverBridge.filter(SPONSOR_ID=querySponsor)
                            history = history.filter(HIST_ACC_SPONSOR_ID__in=driverBridge)
                        except:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except:
                            history = None

                    # Serialize
                    # Summary view
                    if (queryType == "summary"):
                        saleList = []
                        for driver in driverBridge:
                            sponsorfeetotal = 0

                            # Go through order history
                            if history != None:
                                # Go through each driver from bridge table
                                for transaction in history.filter(HIST_ACC_SPONSOR_ID__in=[driver.ACC_SPONSOR_ID]):
                                    # sponsor
                                    sponsor = transaction.HIST_ACC_SPONSOR_ID.SPONSOR_ID
                                    sponsorfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE
                                entry = {}
                                entry['ID'] = driver.ACC_SPONSOR_ID
                                entry['NAME'] = driver.SPONSOR_ID.NAME
                                entry['DRIVER'] = driver.ACCOUNT_ID.NAME
                                entry['START_DATE'] = queryStartDate
                                entry['END_DATE'] = queryEndDate
                                entry['TOTAL_SALES'] = sponsorfeetotal
                                saleList.append(entry)
                    # Detail view
                    else:
                        saleList = []
                        # Go through order history
                        if history != None:
                            # Go through each driver from bridge table
                            for transaction in history:
                                sponsorfeetotal = 0
                                # sponsor
                                sponsor = transaction.HIST_ACC_SPONSOR_ID.SPONSOR_ID
                                sponsorfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE
                                entry = {}
                                entry['ID'] = transaction.HISTORY_ID
                                entry['NAME'] = sponsor.NAME
                                entry['DRIVER'] = transaction.HIST_ACC_SPONSOR_ID.ACCOUNT_ID.NAME
                                entry['START_DATE'] = queryStartDate
                                entry['END_DATE'] = queryEndDate
                                entry['TOTAL_SALES'] = sponsorfeetotal
                                saleList.append(entry)

                    return Response (
                        saleList, status=status.HTTP_200_OK
                    )

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

class SponsorInvoice(APIView):
    authentication_classes = []
    permission_classes = []

    # Get sale history
    def post(self, request, format=None):
        OUR_CUT = .01
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
                querySponsor = request.data["Sponsor"]
                queryStartDate = request.data["Start"]
                queryEndDate = request.data["End"]

                # only admins can use this
                if (user.ACCOUNT_TYPE=="admin"):
                    history = Points.objects.filter(SOURCE='ORDER')
                    sponsorList = Sponsors.objects.all()
                    if (querySponsor != ""):
                        # print(querySponsor)
                        try:
                            sponsorList = Sponsors.objects.filter(SPONSOR_ID=querySponsor)
                            
                            # history = history.filter(HIST_ACC_SPONSOR_ID=Account_Sponsor.objects.filter(SPONSOR_ID=sponsor))
                        except:
                            history = None

                    # Filter start
                    if (queryStartDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__gte=queryStartDate)
                        except:
                            history = None  

                    # Filter end 
                    if (queryEndDate != ""):
                        try:
                            history = history.filter(POINT_CHANGE_DATE__lte=queryEndDate)
                        except:
                            history = None
                    
                    # Serialize
                    salesList = []
                    # print(sponsorList.first())
                    invoiceID = 1
                    for sponsor in sponsorList:
                        sponsorfeetotal= 0
                        driverlist = Account_Sponsor.objects.filter(SPONSOR_ID=sponsor, ACCOUNT_ID__in=Account.objects.filter(ACCOUNT_TYPE='driver'))
                        # entry = {}
                        # entry['INVOICE_ID'] = invoiceID
                        # invoiceID += 1
                        # entry['SPONSOR_NAME'] = sponsor.NAME
                        # entry['START_DATE'] = queryStartDate
                        # entry['END_DATE'] = queryEndDate
                        # entry['TOTAL_FEE'] = "BEGIN"
                        # salesList.append(entry)
                        
                        for driver in driverlist:
                            driverfeetotal = 0
                            if history != None:
                                for transaction in history.filter(HIST_ACC_SPONSOR_ID=driver):
                                    #we get 1% cut
                                    sponsorfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE * OUR_CUT
                                    driverfeetotal += (transaction.POINT_CHANGE * -1) * sponsor.PT_VALUE * OUR_CUT
                                    # print(sponsorfeetotal)
                                entry = {}
                                entry['INVOICE_ID'] = invoiceID
                                entry['SPONSOR_NAME'] = sponsor.NAME
                                invoiceID += 1
                                entry['ACCOUNT_ID'] = driver.ACCOUNT_ID.ACCOUNT_ID
                                entry['ACCOUNT_NAME'] = driver.ACCOUNT_ID.NAME
                                entry['START_DATE'] = queryStartDate
                                entry['END_DATE'] = queryEndDate
                                entry['TOTAL_FEE'] = driverfeetotal
                                salesList.append(entry)
                        entry = {}
                        entry['INVOICE_ID'] = invoiceID
                        invoiceID += 1
                        entry['SPONSOR_NAME'] = sponsor.NAME
                        entry['ACCOUNT_NAME'] = "TOTAL"
                        entry['START_DATE'] = queryStartDate
                        entry['END_DATE'] = queryEndDate
                        entry['TOTAL_FEE'] = sponsorfeetotal
                        salesList.append(entry)
                        # print(entry)

                    
                    # for entry in driverList.data:                            
                    #     # Append
                    #     driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID']).first().ACCOUNT_ID
                    #     driverName = driverBridgeID.NAME
                    #     entry['DRIVER_NAME'] = driverName
                    #     listWithNames.append(entry)
                    # print(Response (
                    #     salesList, status=status.HTTP_200_OK
                    # ))
                    
                    return Response (
                        salesList, status=status.HTTP_200_OK
                    )


            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

class SalesView(APIView):
    authentication_classes = []
    permission_classes = []

    # Search through sale history

    # Get sale history
    def get(self, request, format=None):
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

                # Sponsor
                if (user.ACCOUNT_TYPE=="sponsor"):
                    #get bridge acc so i can get sponsor id
                    sponsorBridge = Account_Sponsor.objects.get(ACCOUNT_ID = user)
                    sponsorInstance = sponsorBridge.SPONSOR_ID
                    driverids = Account_Sponsor.objects.filter(SPONSOR_ID=sponsorInstance)

                    # Filter entries that match driver IDs and are sales
                    driverPoints = Points.objects.filter(HIST_ACC_SPONSOR_ID__in=driverids, SOURCE="ORDER")

                    # Serialize
                    driverList = PointsSerializer(driverPoints, many=True)

                    # Include names
                    listWithNames = []
                    for entry in driverList.data:                            
                        # Append                       
                        driverBridgeID = Account_Sponsor.objects.filter(ACC_SPONSOR_ID=entry['HIST_ACC_SPONSOR_ID']).first().ACCOUNT_ID
                        driverName = driverBridgeID.NAME
                        entry['DRIVER_NAME'] = driverName
                        listWithNames.append(entry)

                    return Response (
                        listWithNames, status=status.HTTP_200_OK
                    )

            except TokenError:
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)