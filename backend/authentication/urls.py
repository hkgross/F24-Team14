from django.urls import include, path
from .views import *
urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name='profile'),
    path("isvalid/", IsValidView.as_view(), name='isvalid'),
    path("create/", CreationView.as_view(), name='creationview'),
    path("mfasetup/", MFAView.as_view(), name='mfasetup'),
    path("request-password-reset/", RequestPasswordResetView.as_view(), name='request-password-reset'),
    path("verify-password/", VerifyPasswordView.as_view(), name='verify-password'),
    path("reset-password/", ResetPasswordView.as_view(), name='reset-password'),
    path("forgot-password/", ForgotPasswordView.as_view(), name='forgot-password'),
    path("forgot-password-two/", ForgotPasswordTwoView.as_view(), name='forgot-password-two/'),
    path('users/', UpdateAccountView.as_view(), name='update-account'),
    path("update-info/", UpdateAccountInfoView.as_view(), name='update-info'),
    path("acc-sponsor/", AccSponsorsView.as_view(), name='acc-sponsor-get'),
    path("control/", ControlDriverView.as_view(), name="control")


]