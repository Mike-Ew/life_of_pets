from django.db import models
from django.contrib.auth.models import AbstractUser
import secrets
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Additional fields can be added here as needed.
    """
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)

    # Privacy settings
    is_profile_public = models.BooleanField(default=True)
    share_location = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username or self.email

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class PasswordResetToken(models.Model):
    """Token for password reset functionality."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at

    class Meta:
        db_table = 'password_reset_tokens'
