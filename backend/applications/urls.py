from django.urls import include, path
from .views import submit_application, app_sponsor_view, app_driver_view, ApplicationDec

urlpatterns = [
    path('<int:id>/', submit_application, name='submit_application'),
    path('sponsor/', app_sponsor_view, name='app_sponsor_view'),
    path('status/', app_driver_view, name='app_driver_view'),
    path("application-choice/", ApplicationDec.as_view(), name='application-choice'),

]