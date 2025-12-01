from django.db import models
from django.conf import settings


class Pet(models.Model):
    """Model representing a pet profile."""

    PERSONALITY_CHOICES = [
        ('calm', 'Calm'),
        ('playful', 'Playful'),
        ('curious', 'Curious'),
        ('gentle', 'Gentle'),
        ('energetic', 'Energetic'),
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


class MatchingPreferences(models.Model):
    """Preferences for pet matching."""

    LOOKING_FOR_CHOICES = [
        ('playmate', 'Playmate'),
        ('adoption', 'Adoption'),
        ('breeding', 'Breeding'),
        ('any', 'Any'),
    ]

    pet = models.OneToOneField(
        Pet,
        on_delete=models.CASCADE,
        related_name='matching_preferences'
    )
    looking_for = models.CharField(
        max_length=20,
        choices=LOOKING_FOR_CHOICES,
        default='playmate'
    )
    # Personality preferences (which personalities to match with)
    preferred_personalities = models.JSONField(default=list, blank=True)
    # Age range preferences
    min_age = models.IntegerField(null=True, blank=True)  # in years
    max_age = models.IntegerField(null=True, blank=True)
    # Size preferences
    preferred_sizes = models.JSONField(default=list, blank=True)  # ['small', 'medium', 'large']
    # Distance preference in km
    max_distance = models.IntegerField(default=50)
    # Is active for matching
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'matching_preferences'
        verbose_name = 'Matching Preferences'
        verbose_name_plural = 'Matching Preferences'


class Swipe(models.Model):
    """Records swipe actions between pets."""

    ACTION_CHOICES = [
        ('like', 'Like'),
        ('dislike', 'Dislike'),
        ('super_like', 'Super Like'),
    ]

    swiper_pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='swipes_made'
    )
    swiped_pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='swipes_received'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'swipes'
        verbose_name = 'Swipe'
        verbose_name_plural = 'Swipes'
        unique_together = ['swiper_pet', 'swiped_pet']

    def __str__(self):
        return f"{self.swiper_pet.name} {self.action}d {self.swiped_pet.name}"


class Match(models.Model):
    """Records mutual matches between pets."""

    pet1 = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='matches_as_pet1'
    )
    pet2 = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='matches_as_pet2'
    )
    matched_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'matches'
        verbose_name = 'Match'
        verbose_name_plural = 'Matches'
        unique_together = ['pet1', 'pet2']

    def __str__(self):
        return f"Match: {self.pet1.name} & {self.pet2.name}"
