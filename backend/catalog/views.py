# views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from authentication.models import Account, Account_Sponsor, Sponsors
from points.models import Points
from audit.models import Audit
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken, TokenError
from rest_framework import status
from rest_framework.response import Response
from authentication.serializers import AccountSerializer, CustomTokenObtainPairSerializer
from .models import Catalog
import requests
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_all(request):
# Get token from request
	# post_data = json.loads(request.body)
	# token = post_data["token"]
	# sponsorid = post_data["sponsor"]
	# try:
		# Check token valid
		# valid_token = UntypedToken(token)

		# Decode the token
		# payload = valid_token.payload
		# userID = payload.get('user_id')

		# Get matching user from db
		# user = Account.objects.get(ACCOUNT_ID=userID)

		# sponsors = Account_Sponsor.objects.get(SPONSOR_ID=sponsorid, ACCOUNT_ID=userID)
	if request.method == 'POST':
		post_data = json.loads(request.body)
		token = post_data["token"]
		try:
			sponsorid = request.GET.get('sponsor')
			if sponsorid is None:
				return JsonResponse({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST) 
			# Check token valid
			valid_token = UntypedToken(token)
			# Decode the token
			payload = valid_token.payload
			userID = payload.get('user_id')

			# Get matching user from db
			user = Account.objects.get(ACCOUNT_ID=userID)
			userSponsors = Account_Sponsor.objects.filter(ACCOUNT_ID=user)
			userSponsorSelected = userSponsors.get(SPONSOR_ID_id=sponsorid)
			if userSponsorSelected is not None:
				sponsorOrg = userSponsorSelected.SPONSOR_ID
				queryAddon = ""
				if sponsorOrg.CAT_MEDIA_TYPE:
					queryAddon += "&media=" + sponsorOrg.CAT_MEDIA_TYPE
				if sponsorOrg.CAT_EXPLICIT is True:
					queryAddon += "&explicit=yes"
				else:
					queryAddon += "&explicit=no"
				query = request.GET.get('q')
				if query:
					api = 'https://itunes.apple.com/search?term=' + query + queryAddon
					print(api)
					response = requests.get(api)
						
					return JsonResponse(response.json())
				
		except TokenError:
			return JsonResponse({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
	

@csrf_exempt
def product_page(request, id):
	if request.method == 'GET':
		api = ' https://itunes.apple.com/lookup?id=' + str(id)
		response = requests.get(api)
		return JsonResponse(response.json())
	elif request.method == 'POST':
		
		post_data = json.loads(request.body)
		token = post_data["token"]
		sponsorid = post_data["sponsor"]
		try:
			# Check token valid
			valid_token = UntypedToken(token)
			# Decode the token
			payload = valid_token.payload
			userID = payload.get('user_id')

			# Get matching user from db
			user = Account.objects.get(ACCOUNT_ID=userID)
			try:
				account_sponsor = Account_Sponsor.objects.get(ACCOUNT_ID_id=userID, SPONSOR_ID_id = sponsorid)
			except:
				return JsonResponse({"error":"User not affiliated with given sponsor"}, status=status.HTTP_400_BAD_REQUEST)
			sponsor = Sponsors.objects.get(SPONSOR_ID = sponsorid)
			sponsorptvalue = sponsor.PT_VALUE
			if account_sponsor is not None:
				api = ' https://itunes.apple.com/lookup?id=' + str(id)
				response = requests.get(api)
				response_data = response.json()
				# print(response_data)
				track_price = float(response_data['results'][0]['trackPrice'])
				if account_sponsor.NUM_POINTS is not None:
					account_sponsor.NUM_POINTS = account_sponsor.NUM_POINTS - (track_price / sponsorptvalue)
					if account_sponsor.NUM_POINTS < 0:
						return JsonResponse({"error":"Not enough points to cover transaction!"}, status=status.HTTP_400_BAD_REQUEST)
					account_sponsor.save()
					audit = Audit()
					audit.EVENT_TIME = datetime.now()
					audit.EVENT_TYPE = 'Reward Redemption'
					audit.AUDIT_ACCOUNT_ID = user
					audit.AUDIT_SPONSOR_ID = sponsor
					audit.DESCRIPTION = 'User ' + str(userID) + ' purchased item ' + str(id) + ' from sponsor ' + str(sponsorid) + ' for ' + str(track_price / sponsorptvalue) + ' points. New point total is ' + str(account_sponsor.NUM_POINTS) + '.'
					audit.save()
					history = Points()
					# print(track_price)
					# print(-(track_price/sponsorptvalue))
					history.POINT_CHANGE = -(track_price / float(sponsorptvalue))
					history.POINT_CHANGE_DATE = datetime.now()
					history.STATUS = "COMPLETED"
					history.ITEM_ID = id
					history.HIST_ACC_SPONSOR_ID = account_sponsor
					history.SOURCE = "ORDER"
					history.REASON = "User bought an item"
					history.save()
					return JsonResponse({"status":"successfully purchased!"},status=status.HTTP_202_ACCEPTED)

				else:
					return JsonResponse({"error":"Error with point value. Please contact an admin or sponsor"}, status=status.HTTP_400_BAD_REQUEST)
			else:
				return JsonResponse({"error":"User not affiliated with given sponsor"}, status=status.HTTP_400_BAD_REQUEST)
		except TokenError:
			return JsonResponse({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
		
# update sponsor catalog preferences (explicit & media type)
@csrf_exempt
def update_prefs(request, id):
	if request.method == 'PATCH':
		post_data = json.loads(request.body)
		token = post_data["token"]
		explicit = post_data["explicit"]
		media_type = post_data["media_type"]
		try:
			# Check token valid
			valid_token = UntypedToken(token)
			# Decode the token
			payload = valid_token.payload
			userID = payload.get('user_id')

			# Get matching user from db
			user = Account.objects.get(ACCOUNT_ID=userID)
			if(user.ACCOUNT_TYPE == 'driver'):
				return JsonResponse({"error": "Not allowed to access"}, status=status.HTTP_401_UNAUTHORIZED)
			elif(user.ACCOUNT_TYPE == 'sponsor'):
				try:
					account_sponsor = Account_Sponsor.objects.get(ACCOUNT_ID_id=userID, SPONSOR_ID_id = id)
				except:
					return JsonResponse({"error":"User not affiliated with given sponsor"}, status=status.HTTP_400_BAD_REQUEST)
			elif(user.ACCOUNT_TYPE=='admin'):
				pass
			else:
				return JsonResponse({"error":"Contact an admin"}, status=status.HTTP_400_BAD_REQUEST)
			sponsor = Sponsors.objects.get(SPONSOR_ID=id)
			if(explicit is not None):
				if explicit == "on":
					sponsor.CAT_EXPLICIT = 1
				else:
					sponsor.CAT_EXPLICIT = 0
			if(media_type is not None):
				if(media_type == ""):
					sponsor.CAT_MEDIA_TYPE = 'all'
				else:
					sponsor.CAT_MEDIA_TYPE = media_type
			sponsor.save()
			return JsonResponse({},status=status.HTTP_200_OK)
			

		except TokenError:
			return JsonResponse({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
