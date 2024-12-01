from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()

# Router path
router.register(r'sponsors', SponsorsViewSet, basename='sponsors')
#router.register(r'mydrivers', MyDriversViewSet, basename='mydrivers')

# URL path for rest_framework
urlpatterns = [
    path('', include(router.urls)),
    path('mydrivers/', MyDriversViewSet.as_view(), name="mydrivers"),
    path('directory/', MyCompanyViewSet.as_view(), name="directory"),
    path('sponsorlist/', GetSponsors.as_view(), name="sponsor"),
    path('create-sponsor/', CreateSponsor.as_view(), name="create-sponsor"),

    path('getspon/', GetAcceptedSponsors.as_view(), name="getsponsors"),
]
