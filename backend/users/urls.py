from django.urls import path
from .views import (
    RegisterView,
    CurrentUserView,
    ForgotPasswordView,
    VerifyResetTokenView,
    ResetPasswordView,
    GoogleAuthView,
    FacebookAuthView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-reset-token/', VerifyResetTokenView.as_view(), name='verify-reset-token'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('facebook/', FacebookAuthView.as_view(), name='facebook-auth'),
]
