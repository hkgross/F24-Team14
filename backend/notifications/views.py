from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NotificationPreference
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from authentication.models import Account
import json

class NotificationPreferenceGetter(APIView):
    def get(self, request):
        try:
            username = request.query_params.get('username')
            if not username:
                return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            preferences = NotificationPreference.objects.filter(username=username).first()
            
            if not preferences:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            data = {
                "order_error_enabled": preferences.order_error_enabled,
                "order_placed_enabled": preferences.order_placed_enabled,
                "points_added_enabled": preferences.points_added_enabled,
            }
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class NotificationPreferenceSaver(APIView):
    def post(self, request):
        try:
            data = request.data
            username = data.get("username")
            print(f"Requested username: {username}")  
            
            if not username:
                return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(username=username)  

            preferences, created = NotificationPreference.objects.get_or_create(username=username)

            preferences.order_error_enabled = data.get("order_error_enabled", preferences.order_error_enabled)
            preferences.order_placed_enabled = data.get("order_placed_enabled", preferences.order_placed_enabled)
            preferences.points_added_enabled = data.get("points_added_enabled", preferences.points_added_enabled)
            
            preferences.save()

            action = "created" if created else "updated"
            return Response({"message": f"Preferences {action} successfully for {username}"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdatePointsNotificationView(APIView):
    def post(self, request):
        try:
            username = request.data.get('user')
          
            if not username:
                return Response(
                    {'error': 'User is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            account = Account.objects.get(ACCOUNT_ID=username)

            try:
                preferences = NotificationPreference.objects.get(username=account.USERNAME)
            except NotificationPreference.DoesNotExist:
                return Response(
                    {'error': 'Notification preferences not found for this user'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if preferences.points_added_enabled:
                send_mail(
                    'Points Update Notification',
                    f'Hello {account.USERNAME},\n\nYour points have been updated.',
                    settings.DEFAULT_FROM_EMAIL,
                    [account.EMAIL],
                    fail_silently=False,
                )
                return Response({'message': 'Notification email sent successfully'}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'message': 'User has disabled notifications for points updates'},
                    status=status.HTTP_200_OK
                )

        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdatePurchaseNotificationView(APIView):
    def post(self, request):
        username = request.data.get('userName')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        email = user.EMAIL
        if not email:
            return Response({'error': 'User email not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            try:
                preferences = NotificationPreference.objects.get(username=user.USERNAME)
            except NotificationPreference.DoesNotExist:
                return Response({'error': 'Notification preferences not found for this user'}, status=status.HTTP_404_NOT_FOUND)

            if preferences.order_placed_enabled:
                send_mail(
                    'Purchase Notice',
                    'ORDER COMPLETED!',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({'message': 'Purchase notification sent to user'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'User has disabled notifications for order placement'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
class UpdatePurchaseErrorNotificationView(APIView):
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Account.objects.get(USERNAME=username)
        except Account.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        email = user.EMAIL
        if not email:
            return Response({'error': 'User email not found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            try:
                preferences = NotificationPreference.objects.get(username=user.USERNAME)
            except NotificationPreference.DoesNotExist:
                return Response({'error': 'Notification preferences not found for this user'}, status=status.HTTP_404_NOT_FOUND)

            if preferences.order_error_enabled:
                send_mail(
                    'Purchase Error Notice',
                    'ORDER ERROR: There was an issue with your purchase.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({'message': 'Purchase error notification sent to user'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'User has disabled notifications for purchase errors'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)