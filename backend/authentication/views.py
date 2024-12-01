from django.shortcuts import render
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken, TokenError
from .models import Account, Token, Account_Sponsor
from sponsors.models import Sponsors
from .serializers import AccountSerializer, CustomTokenObtainPairSerializer, AccountSponsorSerializer
import logging
from datetime import datetime
from audit.models import Audit
from datetime import timedelta
from django.utils import timezone
from authentication.models import Account
import pyotp
import time
import qrcode
import PIL
import base64
from io import BytesIO

SALT = "bnd9285n0zmvj82er8l3n63mzo1ur9c8d2mfid89awu34hgbrfja129dd83j9438h"

logger = logging.getLogger(__name__)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request, format=None):
        # Data from login form
        username = request.data["username"]
        password = request.data["password"]
        mfa = request.data["mfa"]
        remember_me = request.data["remember"]

        # Hash password
        hashed_password = make_password(password=password, salt=SALT)

        if remember_me: 
             # extend session 
            request.session.set_expiry(604800)
        else:
            # close session
            request.session.set_expiry(0) 

        # Check if username exists
        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            print(hashed_password)
            return Response(
                {
                    "success": False,
                    "message": "Invalid Login",
                    "remaining_attempts": 3
                },
                status=status.HTTP_200_OK
            )


        if user.FAILED_ATTEMPTS >= 3 and user.LOCKOUT_UNTIL and user.LOCKOUT_UNTIL > timezone.now():
            return Response(
                {
                    "success": False,
                    "message": "Account is temporarily locked. Please try again later.",
                    "lockout_time_remaining":(user.LOCKOUT_UNTIL - timezone.now()).seconds
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Ready fields for audit logging
        # Might exclude if table updates to include multiple sponsors for driver
        if user.ACCOUNT_TYPE != 'admin':
            account_sponsor = Account_Sponsor.objects.filter(ACCOUNT_ID=user.ACCOUNT_ID)
            sponsor = account_sponsor.first().SPONSOR_ID

        # Invalid login
        if not check_password(password, user.PASSWORD):

            print(make_password(password=password, salt=SALT))
            print(user.PASSWORD)
            user.FAILED_ATTEMPTS += 1

            remaining_attempts = max(0, 3 - user.FAILED_ATTEMPTS)

            # Record failed attempt in audit log
            auditEntry = Audit(AUDIT_SPONSOR_ID=sponsor,
                                AUDIT_ACCOUNT_ID=user,
                                EVENT_TYPE="Login",
                                DESCRIPTION=f"Username:{user.USERNAME} User ID:{user.ACCOUNT_ID} failed login")
            auditEntry.save()

            if user.FAILED_ATTEMPTS >= 3:
                user.LOCKOUT_UNTIL = timezone.now() + timedelta(minutes=5)
            user.save()

            return Response(
                {
                    "success": False,
                    "message": "Invalid Login",
                    "remaining_attempts": remaining_attempts 
                },
                status=status.HTTP_200_OK,
            )
        
        # Valid Login
        else:
            print("*********")
            print(user.MFA_KEY)
            # Check if MFA is enabled
            if user.MFA_KEY:
                totp = pyotp.TOTP(user.MFA_KEY)
                if not totp.verify(mfa):
                    return Response(
                        {
                            "success": False,
                            "message": "Invalid Login",
                        },
                        status=status.HTTP_200_OK,
                    )

            user.FAILED_ATTEMPTS = 0
            user.LOCKOUT_UNTIL = None
            user.save()

            # Record success in audit log
            if user.ACCOUNT_TYPE != 'admin':
                auditEntry = Audit(AUDIT_SPONSOR_ID=sponsor,
                                    AUDIT_ACCOUNT_ID=user,
                                    EVENT_TYPE="Login",
                                    DESCRIPTION=f"Username:{user.USERNAME} User ID:{user.ACCOUNT_ID} logged in successfully")
            else:
                auditEntry = Audit(AUDIT_SPONSOR_ID=None,
                                    AUDIT_ACCOUNT_ID=user,
                                    EVENT_TYPE="Login",
                                    DESCRIPTION=f"Username:{user.USERNAME} User ID:{user.ACCOUNT_ID} logged in successfully")
            auditEntry.save()

            # Generate JWT token
            refresh = CustomTokenObtainPairSerializer.get_token(user)

            return Response(
                {
                    "success": True,
                    "message": "You are logged in",
                    "user": user.USERNAME, 
                    "type": user.ACCOUNT_TYPE,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )

# Check if token valid
class IsValidView(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):

        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        # Extract
        if auth_header:
            # Split bearer token to only get token
            token = auth_header.split('Bearer ')[1]       

            try:
                # Check if valid
                valid_token = UntypedToken(token)

                return Response({"valid": True}, status=status.HTTP_200_OK)

            except TokenError:
                print("token error")
                return Response({"valid": False}, status=status.HTTP_200_OK)

        # Missing token in header
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

# Get data related to user from token
class ProfileView(APIView):
    def post(self, request):
        # Get token from request
        token = request.data["token"]

        try:
            # Check token valid
            valid_token = UntypedToken(token)

            # Decode the token
            payload = valid_token.payload
            userID = payload.get('user_id')

            # Get matching user from db
            user = Account.objects.get(ACCOUNT_ID=userID)

            # Return all fields except password
            entry = {}
            entry['ACCOUNT_ID'] = user.ACCOUNT_ID
            entry['ADDRESS'] = user.ADDRESS
            entry['BIO'] = user.BIO
            entry['BIRTHDAY'] = user.BIRTHDAY
            entry['CREATION_DATE'] = user.CREATION_DATE
            entry['EMAIL'] = user.EMAIL
            entry['LAST_LOGIN'] = user.LAST_LOGIN
            entry['NAME'] = user.NAME
            entry['USERNAME'] = user.USERNAME
            entry['account_status_display'] = user.STATUS
            entry['account_type_display'] = user.ACCOUNT_TYPE

            # Return user info
            return Response(entry, status=status.HTTP_200_OK)
        
        except TokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

#get acc sponsor relationships from token
class AccSponsorsView(APIView):
    def post(self, request):
        # Get token from request
        token = request.data["token"]
        try:
            # Check token valid
            valid_token = UntypedToken(token)

            # Decode the token
            payload = valid_token.payload
            userID = payload.get('user_id')

            # Get matching user from db
            # user = Account.objects.get(ACCOUNT_ID=userID)
            
            # Nick - NEED TO CHANGE THIS TO RETURN ALL AND THEN DO DROPDOWN ON DASH FOR POINTS OR JUST LIST ALL
            account = Account_Sponsor.objects.filter(ACCOUNT_ID=Account.objects.get(ACCOUNT_ID=userID))

            # Return user info
            return Response(AccountSponsorSerializer(account, many=True).data, status=status.HTTP_200_OK)
        
        except TokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
    
# Create new account
class CreationView(APIView):
    def post(self, request, format=None):
        print("Create got a request")
        # Get token from request header
        #auth_header = request.META.get('HTTP_AUTHORIZATION')
        #print("ALL", request.data["token"])

        # Split bearer token to only get token
        token = request.data["token"]
        print("token", token)

        if token == None:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            if token == "UNREGISTERED":
                print("unregistered")
            else:
                print("checking validity")
                # Check token valid
                valid_token = UntypedToken(token)

                # Decode the token
                payload = valid_token.payload
                userID = payload.get('user_id')
                print("got user id")

                # Get matching user from db
                user = Account.objects.get(ACCOUNT_ID=userID)
                print(user.ACCOUNT_TYPE)

                #check if authorized to create account
                if user.ACCOUNT_TYPE != "admin" and user.ACCOUNT_TYPE != "sponsor" :
                    print("unauthorized")
                    return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

            print("parsing data")
            print(request.data["password"])
            # Data from account creation form
            name = request.data["name"]
            address = request.data["address"]
            birthday = request.data["birthday"]
            username = request.data["username"]
            email = request.data["email"]
            bio = request.data["bio"]
            password = request.data["password"]
            accountType = request.data["accountType"]
            accSponsorId = request.data["accSponsorId"]
            print(request)
            print(accountType)

            if token=="UNREGISTERED" and accountType != "driver" :
                return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

            #check if authorized to create an admin
            if accountType == "admin" and user.ACCOUNT_TYPE != "admin":
                print("unauth admin")
                return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
                
            # Hash password
            hashed_password = make_password(password=password, salt=SALT)

            print("hashed pword")
            # Check if username is taken
            try:
                print("check for username")
                user = Account.objects.get(USERNAME=username)

                #User found. Cancel the creation
                return Response(
                    {
                        "success": False,
                        "message": "Username already taken",
                    },
                    status=status.HTTP_200_OK
                )
            except Account.DoesNotExist:
                print("All good")
                # check if sponsor exists
                try:
                    sponsor = Sponsors.objects.get(SPONSOR_ID=accSponsorId)
                    print("sponsor found")
                    # Access individual choices
                    print(accountType)
                    #Ensure account type is valid
                    if accountType!="admin" and accountType!="sponsor":
                        accountType = "driver"


                    # Create a new Account entry and pus it to the DB
                    newAccount = Account.objects.create(
                        NAME=name,
                        ADDRESS=address,
                        # ACC_SPONSOR_ID=sponsor,
                        CREATION_DATE=datetime.now(),
                        LAST_LOGIN=datetime.now(),
                        ACCOUNT_TYPE=accountType,
                        # NUM_POINTS=0,
                        BIRTHDAY=birthday,
                        USERNAME=username,
                        EMAIL=email,
                        BIO=bio,
                        PASSWORD=hashed_password,
                        STATUS="active"
                    )
                    newAccountSponsor = Account_Sponsor.objects.create(
                        ACCOUNT_ID=newAccount,
                        SPONSOR_ID=sponsor,
                        NUM_POINTS=0,
                        STATUS='accepted',
                        HIRING_DESC = 'account created by super user',
                        REJECT_DESC = '',
                        APP_DATE = datetime.now()
                    )

                    if Account.objects.filter(USERNAME=username).exists():
                        print("Account was successfully created!")
                        return Response(
                            {
                                "success": True,
                                "message": "User created",
                            },
                            status=status.HTTP_200_OK
                            )
                    else:
                        print("Account creation failed.")
                        return Response(
                            {
                                "success": False,
                                "message": "Something went wrong with account creation",
                            },
                            status=status.HTTP_200_OK
                            )

                    
                except Sponsors.DoesNotExist:
                    return Response(
                        {
                            "success": False,
                            "message": "Sponsor does not exist",
                        },
                        status=status.HTTP_200_OK
                    )

                
                
        except TokenError:
            print("Token error")
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        # Missing token in header
        print("no token")
        return Response({"Error": "No token received"}, status=status.HTTP_400_BAD_REQUEST)

#MFA Stuff
class MFAView(APIView):
    def post(self, request):
        # Get token from request
        print(request.data)
        token = request.data["token"]

        try:
            # Check token valid
            valid_token = UntypedToken(token)

            # Decode the token
            payload = valid_token.payload
            userID = payload.get('user_id')

            # Get matching user from db
            user = Account.objects.get(ACCOUNT_ID=userID)

            # Generate MFA key
            mfa_key = pyotp.random_base32()

            # Save key to user
            user.MFA_KEY = mfa_key
            user.save()

            # Generate QR code
            totp = pyotp.TOTP(mfa_key)
            qr_code = totp.provisioning_uri(name=user.USERNAME, issuer_name="PandaSoft Driver Rewards")
            img = qrcode.make(qr_code)
            buffer = BytesIO()
            img.save(buffer, format="PNG")  # Save the image to the buffer in PNG format
            buffer.seek(0)

            # Convert the bytes to a base64 string
            b64Str = 'data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode('utf-8')
            buffer.close()
            #convert img to b64 string
            
            print("b64 string "+b64Str)

            return Response({"url":qr_code,"qrCode":b64Str,"secretKey": mfa_key}, status=status.HTTP_200_OK)
        
        except TokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class RequestPasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            logger.warning("Email not provided in request")
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Account.objects.get(EMAIL=email)
        except Account.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate token for password reset
        token = CustomTokenObtainPairSerializer.get_token(user)

        # Direct link to the password reset page, including the token
        reset_url = f"http://localhost:3000/password-reset/?token={str(token)}"  

        try:
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.EMAIL],
                fail_silently=False,
            )
            logger.info(f"Password reset link sent to {user.EMAIL}")
            return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send email to {user.EMAIL}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class VerifyPasswordView(APIView):
    def post(self, request):
        # Data from form
        username = request.data["username"]
        currentPassword = request.data["currentPassword"]
        newPassword = request.data["newPassword"]
        verifyPassword = request.data["verifyPassword"]

        # Hash password
        current_hashed_password = make_password(password=currentPassword, salt=SALT)
        new_hashed_password = make_password(password=newPassword, salt=SALT)
        verify_hashed_password = make_password(password=verifyPassword, salt=SALT)

        # Check if username exists
        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Invalid",
                },
                status=status.HTTP_200_OK
            )
        if currentPassword == '' or newPassword == '' or verifyPassword == '':
            return Response(
                {
                    "success": False,
                    "message": "Missing information", 
                },
                status=status.HTTP_200_OK,
            )
        elif user.PASSWORD != current_hashed_password:
            return Response(
                {
                    "success": False,
                    "message": "Incorrect current password", 
                },
                status=status.HTTP_200_OK,
            )
        elif user.PASSWORD == new_hashed_password:
            return Response(
                {
                    "success": False,
                    "message": "New password must be different"
                },
                status=status.HTTP_200_OK,
            )
        elif new_hashed_password != verify_hashed_password:
            return Response(
                {
                    "success": False,
                    "message": "New password does not match"
                },
                status=status.HTTP_200_OK,
            )
        else:
            user.PASSWORD = new_hashed_password
            user.save()
            return Response(
                {
                    "success": True,
                    "message": "Password updated",
                    "user": user.USERNAME, 
                },
                status=status.HTTP_200_OK,
            )    


            
class ResetPasswordView(APIView):
    def post(self, request):
        username = request.data["username"]
        # Check if username exists
        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "User does not exist",
                },
                status=status.HTTP_200_OK
            )
        else:
            #print("ACCOUNT TYPE: ", user.ACCOUNT_TYPE)
            # Generate JWT token
            refresh = CustomTokenObtainPairSerializer.get_token(user)

            #print("TOKEN: ", str(refresh.access_token))
            #print("REFRESH TOKEN: ", str(refresh))
            return Response(
                {
                    "success": True,
                    "message": "Found user",
                    "user": user.USERNAME, 
                    "type": user.ACCOUNT_TYPE,
                },
                status=status.HTTP_200_OK,
            )
        
class ForgotPasswordView(APIView):
    def post(self, request):
        # Data from form
        username = request.data["username"]
        email = request.data["email"]
        newPassword = request.data["newPassword"]
        verifyPassword = request.data["verifyPassword"]

        # Hash password
        new_hashed_password = make_password(password=newPassword, salt=SALT)
        verify_hashed_password = make_password(password=verifyPassword, salt=SALT)

        # Check if username exists
        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Invalid",
                },
                status=status.HTTP_200_OK
            )
        if email == '' or newPassword == '' or verifyPassword == '':
            return Response(
                {
                    "success": False,
                    "message": "Missing information", 
                },
                status=status.HTTP_200_OK,
            )
        elif email != user.EMAIL:
            return Response(
                {
                    "success": False,
                    "message": "Incorrect email", 
                },
                status=status.HTTP_200_OK,
            )
        elif user.PASSWORD == new_hashed_password:
            return Response(
                {
                    "success": False,
                    "message": "New password must be different"
                },
                status=status.HTTP_200_OK,
            )
        elif new_hashed_password != verify_hashed_password:
            return Response(
                {
                    "success": False,
                    "message": "New password does not match"
                },
                status=status.HTTP_200_OK,
            )
        else:
            user.PASSWORD = new_hashed_password
            user.save()

            # Update audit log
            if user.ACCOUNT_TYPE != 'admin':
                auditEntry = Audit(AUDIT_SPONSOR_ID=user,
                                    AUDIT_ACCOUNT_ID=user,
                                    EVENT_TYPE="Account Update",
                                    DESCRIPTION=f"{user.NAME} User ID:{user.ACCOUNT_ID} password updated by self")
                auditEntry.save()

            return Response(
                {
                    "success": True,
                    "message": "Password updated",
                    "user": user.USERNAME, 
                },
                status=status.HTTP_200_OK,
            )
        
class UpdateAccountInfoView(APIView):
    def post(self, request):
        email = request.data.get('currentEmail')
        if not email:
            logger.warning("Email not provided in request")
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Account.objects.get(EMAIL=email)
        except Account.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        updateList = []
        if request.data.get('name'):
            updateList.append('Name')
        if request.data.get('address'):
            updateList.append('Address')
        if request.data.get('email'):
            updateList.append('Email')
        if request.data.get('birthday'):
            updateList.append('Birthday')
        if request.data.get('username'):
            updateList.append('Username')
        if request.data.get('bio'):
            updateList.append('Bio')

        try:
            send_mail(
                'Account Information Updated',
                f'Updates were made to your account: {updateList}',
                settings.DEFAULT_FROM_EMAIL,
                [user.EMAIL],
                fail_silently=False,
            )
            logger.info(f"Account update email sent to {user.EMAIL}")
            return Response({'message': 'Account update email sent'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to send email to {user.EMAIL}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordTwoView(APIView):
    def post(self, request):
        # Data from the form
        email = request.data.get("email")
        newPassword = request.data.get("newPassword")
        verifyPassword = request.data.get("verifyPassword")

        # Check if all fields are provided
        if not all([email, newPassword, verifyPassword]):
            return Response(
                {"success": False, "message": "Missing information"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if the email exists
        try:
            user = Account.objects.get(EMAIL=email)  # Find the user by email
        except Account.DoesNotExist:
            return Response(
                {"success": False, "message": "Email not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if the new password matches the verification password
        if newPassword != verifyPassword:
            return Response(
                {"success": False, "message": "Passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure the new password is different from the old password
        if check_password(newPassword, user.PASSWORD):
            return Response(
                {"success": False, "message": "New password must be different"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Hash and update the user's password
        print(f"Old Password: {user.PASSWORD}")
        user.PASSWORD = make_password(newPassword)
        print(f"New Hashed Password: {user.PASSWORD}")
        user.save()
        return Response(
            {"success": True, "message": "Password updated", "user": user.USERNAME},
            status=status.HTTP_200_OK,
        )


class UpdateAccountView(APIView):
    def put(self, request):
        account_id = request.data.get("ACCOUNT_ID")  
        name = request.data.get("NAME")
        account_type = request.data.get("account_type_display")
        account_status = request.data.get("account_status_display") 
        account_bio = request.data.get("account_bio_display")

        
        if not all([account_id, name, account_type, account_bio]):
            return Response(
                {"success": False, "message": "Missing required information (account ID, name, or account type)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        user = get_object_or_404(Account, ACCOUNT_ID=account_id)

        
        user.NAME = name
        user.account_type_display = account_type
        user.BIO = account_bio
        
        if account_status:  
            user.STATUS = account_status
        
        try:
            user.save()
            return Response(
                {"success": True, "message": "User updated successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print("Error updating user:", e)
            return Response(
                {"success": False, "message": "Failed to update user"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Generate token for driver
class ControlDriverView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request, format=None):
        # Get driver account ID from request
        driverID = request.data["driver"]
        # Get driver user
        user = Account.objects.get(ACCOUNT_ID=driverID)

        # Generate JWT token
        refresh = CustomTokenObtainPairSerializer.get_token(user)

        # Get token from request header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        token = auth_header.split('Bearer ')[1]

        # Check if valid
        valid_token = UntypedToken(token)

        # Decode token
        payload = valid_token.payload
        sponsorID = payload.get('user_id')

        # Record success in audit log
        sponsor = Account.objects.get(ACCOUNT_ID=sponsorID)
        sponsorOrg = Account_Sponsor.objects.get(ACCOUNT_ID=sponsor).SPONSOR_ID

        auditEntry = Audit(AUDIT_SPONSOR_ID=sponsorOrg,
                            AUDIT_ACCOUNT_ID=user,
                            EVENT_TYPE="Login",
                            DESCRIPTION=f"Username:{sponsor.USERNAME} User ID:{sponsor.ACCOUNT_ID} logged in successfully to Username:{user.USERNAME} User ID: {user.ACCOUNT_ID}")
        auditEntry.save()

        return Response(
                {
                    "success": True,
                    "message": "You are logged in",
                    "user": user.USERNAME, 
                    "type": user.ACCOUNT_TYPE,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )

