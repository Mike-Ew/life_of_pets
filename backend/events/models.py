from django.db import models
from django.conf import settings
from pets.models import Pet


class Event(models.Model):
    """Model for pet-related events and reminders (vet visits, grooming, etc.)."""

    EVENT_TYPES = [
        ('vaccination', 'Vaccination'),
        ('vet_visit', 'Vet Visit'),
        ('grooming', 'Grooming'),
        ('feeding', 'Feeding'),
        ('medication', 'Medication'),
        ('other', 'Other'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='events'
    )
    pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='events'
    )
    title = models.CharField(max_length=200)
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPES,
        default='other'
    )
    description = models.TextField(blank=True)
    event_date = models.DateTimeField()

    # Reminder settings
    send_reminder = models.BooleanField(default=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} for {self.pet.name}"

    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['event_date']
