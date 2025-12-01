from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .models import User, PasswordResetToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyResetTokenSerializer,
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    """Request a password reset token."""
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)

            # Invalidate any existing tokens
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

            # Create new token
            reset_token = PasswordResetToken.objects.create(user=user)

            # For development, we'll return the token directly
            # In production, you'd send this via email
            if settings.DEBUG:
                return Response({
                    'message': 'Password reset token generated.',
                    'token': reset_token.token,  # Only in DEBUG mode
                    'note': 'In production, this token would be sent via email.'
                }, status=status.HTTP_200_OK)
            else:
                # Send email (configure EMAIL settings in production)
                reset_link = f"yourapp://reset-password?token={reset_token.token}"
                send_mail(
                    'Password Reset Request',
                    f'Use this link to reset your password: {reset_link}\n\nThis link expires in 1 hour.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({
                    'message': 'If an account with this email exists, a reset link has been sent.'
                }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            # Return same message to prevent email enumeration
            return Response({
                'message': 'If an account with this email exists, a reset link has been sent.'
            }, status=status.HTTP_200_OK)


class VerifyResetTokenView(APIView):
    """Verify if a password reset token is valid."""
    permission_classes = [AllowAny]
    serializer_class = VerifyResetTokenSerializer

    def post(self, request):
        serializer = VerifyResetTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.is_valid():
                return Response({
                    'valid': True,
                    'message': 'Token is valid.'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'message': 'Token has expired or already been used.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """Reset password using a valid token."""
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)

            if not reset_token.is_valid():
                return Response({
                    'message': 'Token has expired or already been used.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Reset the password
            user = reset_token.user
            user.set_password(password)
            user.save()

            # Mark token as used
            reset_token.used = True
            reset_token.save()

            return Response({
                'message': 'Password has been reset successfully.'
            }, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({
                'message': 'Invalid token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class GoogleAuthView(APIView):
    """Authenticate with Google OAuth."""
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')

        if not id_token:
            return Response({
                'error': 'ID token is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token with Google
            import requests
            google_response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}'
            )

            if google_response.status_code != 200:
                return Response({
                    'error': 'Invalid Google token'
                }, status=status.HTTP_400_BAD_REQUEST)

            google_data = google_response.json()
            email = google_data.get('email')
            google_id = google_data.get('sub')
            first_name = google_data.get('given_name', '')
            last_name = google_data.get('family_name', '')

            if not email:
                return Response({
                    'error': 'Email not provided by Google'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0] + '_' + google_id[:8],
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'created': created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FacebookAuthView(APIView):
    """Authenticate with Facebook OAuth."""
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')

        if not access_token:
            return Response({
                'error': 'Access token is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token with Facebook
            import requests
            fb_response = requests.get(
                f'https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token={access_token}'
            )

            if fb_response.status_code != 200:
                return Response({
                    'error': 'Invalid Facebook token'
                }, status=status.HTTP_400_BAD_REQUEST)

            fb_data = fb_response.json()
            email = fb_data.get('email')
            fb_id = fb_data.get('id')
            first_name = fb_data.get('first_name', '')
            last_name = fb_data.get('last_name', '')

            if not email:
                return Response({
                    'error': 'Email not provided by Facebook. Please ensure your Facebook account has an email.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': f"fb_{fb_id[:12]}",
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'created': created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
