# views.py
from django.shortcuts import render, redirect
from audit.models import Audit
from authentication.models import Account, Account_Sponsor
from sponsors.models import Sponsors
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from rest_framework.views import APIView
import logging
from django.core.mail import send_mail
from rest_framework.response import Response
from django.conf import settings
from rest_framework import status

logger = logging.getLogger(__name__)

@csrf_exempt
def submit_application(request, id):
    if request.method == 'GET':
        try:
            sponsor = Sponsors.objects.get(SPONSOR_ID=id)
        except Sponsors.DoesNotExist:
            return redirect('404_page')  # Redirect to a 404 page or handle the error properly
        return JsonResponse({'sponsor': sponsor.NAME, 'sponsor_id': sponsor.SPONSOR_ID})

    if request.method == 'POST':
        application = Account_Sponsor()
        post_data = json.loads(request.body)
        application.SPONSOR_ID = Sponsors.objects.get(SPONSOR_ID=post_data['SPONSOR_ID'])
        application.ACCOUNT_ID = Account.objects.get(ACCOUNT_ID=post_data['ACCOUNT_ID'])
        application.HIRING_DESC = post_data['HIRING_DESC']
        application.APP_DATE = datetime.now()
        application.NUM_POINTS = 0
        application.STATUS = 'OPEN'
        application.save()

        # Log the received email and application details
        email = Account.objects.get(ACCOUNT_ID=post_data['ACCOUNT_ID']).EMAIL
        application_details = application.HIRING_DESC
        logger.info(f"Received email: {email}")
        logger.info(f"Received application details: {application_details}")

        # Create the email content
        email_subject = 'Application Submission Confirmation'
        email_message = f"""
        Hello {email},

        Thank you for your application!

        Here are the details of your application:
        {application_details}

        We will review your application and get back to you shortly.

        Best regards,
        The Team
        """

        # Try sending the email
        try:
            send_mail(
                email_subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            logger.info(f"Application submission notification sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")

        return redirect('/about/')
    
@csrf_exempt
def app_sponsor_view(request):
    if request.method == 'GET':
        applications = Account_Sponsor.objects.order_by('ACCOUNT_ID')
        # Serialize the queryset (you can adjust the fields as needed)
        applications_list = list(applications.values())
        for application in applications_list:
            application["USER_EMAIL"] = Account.objects.get(ACCOUNT_ID = application["ACCOUNT_ID_id"]).EMAIL
        # print(applications_list)
        return JsonResponse(applications_list, safe=False)
    if request.method == 'PATCH':
        post_data = json.loads(request.body)
        application = Account_Sponsor.objects.get(ACCOUNT_SPONSOR = post_data['APPLICATION_ID'])
        application.STATUS = post_data['STATUS']
        application.save()
        if(post_data['STATUS'] == 'ACCEPTED'):
            audit = Audit()
            audit.AUDIT_ACCOUNT_ID = post_data['ACCOUNT_ID']
            audit.AUDIT_SPONSOR_ID = post_data['SPONSOR_ID']
            audit.EVENT_TYPE = "Application Acceptance"
            audit.DESCRIPTION = "An application has been accepted"
            audit.EVENT_TIME = datetime.now()
            audit.save()
        if(post_data['STATUS'] == 'REJECTED'):
            audit = Audit()
            audit.AUDIT_ACCOUNT_ID = post_data['ACCOUNT_ID']
            audit.AUDIT_SPONSOR_ID = post_data['SPONSOR_ID']
            audit.EVENT_TYPE = "Application Rejection"
            audit.DESCRIPTION = "An application has been rejected"
            audit.EVENT_TIME = datetime.now()
            audit.save()
        return redirect('/about/')
    


@csrf_exempt
def app_driver_view(request):
    if request.method == 'POST':
        if(request.body != None):
            data = json.loads(request.body)
            applications = Account_Sponsor.objects.filter(ACCOUNT_ID=data['ACCOUNT_ID'])
            applications_list = list(applications.values())
            return JsonResponse(applications_list, safe=False)
        else:
            return None
        


class ApplicationDec(APIView):
    def post(self, request):
        email = request.data.get('email')
        action = request.data.get('action')  # Get the action from the request ('accept' or 'reject')

        if not email:
            logger.warning("Email not provided in request")
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not action or action not in ['accept', 'reject']:
            logger.warning("Invalid or missing action in request")
            return Response({'error': 'Valid action (accept or reject) is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user by email
        try:
            user = Account.objects.get(EMAIL=email)
        except Account.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Define email subject and message based on the action
        if action == 'accept':
            subject = 'Application Accepted'
            message = 'Congratulations! Your application has been accepted.'
        else:
            subject = 'Application Rejected'
            message = 'We regret to inform you that your application has been rejected.'

        # Send the email
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,  # Use the default email sender from Django settings
                [user.EMAIL],
                fail_silently=False,
            )
            logger.info(f"Email sent successfully to {user.EMAIL} for action: {action}")
        except Exception as e:
            logger.error(f"Failed to send email to {user.EMAIL}: {e}")
            return Response({'error': f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)