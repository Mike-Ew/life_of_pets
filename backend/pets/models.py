from django.db import models
from django.conf import settings


class Pet(models.Model):
    """Model representing a pet profile."""

    PERSONALITY_CHOICES = [
        ('calm', 'Calm'),
        ('playful', 'Playful'),
        ('curious', 'Curious'),
        ('gentle', 'Gentle'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pets'
    )
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100, blank=True)
    age = models.CharField(max_length=20, blank=True)  # e.g., "3 yrs"
    personality = models.CharField(
        max_length=20,
        choices=PERSONALITY_CHOICES,
        default='calm'
    )
    height = models.CharField(max_length=20, blank=True)  # e.g., "60 cm"
    weight = models.CharField(max_length=20, blank=True)  # e.g., "30 kg"
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

    class Meta:
        db_table = 'pets'
        verbose_name = 'Pet'
        verbose_name_plural = 'Pets'
        ordering = ['-created_at']


class PetPhoto(models.Model):
    """Model for storing multiple photos for a pet."""

    pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='pet_photos/')
    is_main = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.pet.name}"

    class Meta:
        db_table = 'pet_photos'
        verbose_name = 'Pet Photo'
        verbose_name_plural = 'Pet Photos'
        ordering = ['-is_main', '-uploaded_at']

    def save(self, *args, **kwargs):
        """Ensure only one main photo per pet."""
        if self.is_main:
            PetPhoto.objects.filter(pet=self.pet, is_main=True).update(is_main=False)
        super().save(*args, **kwargs)
