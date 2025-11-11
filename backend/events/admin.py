from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for Event model."""

    list_display = ['title', 'pet', 'owner', 'event_type', 'event_date', 'send_reminder']
    list_filter = ['event_type', 'send_reminder', 'event_date', 'created_at']
    search_fields = ['title', 'pet__name', 'owner__username']
    readonly_fields = ['reminder_sent_at', 'created_at', 'updated_at']
    date_hierarchy = 'event_date'

    fieldsets = [
        ('Event Information', {
            'fields': ('owner', 'pet', 'title', 'event_type', 'description')
        }),
        ('Schedule', {
            'fields': ('event_date', 'send_reminder', 'reminder_sent_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ]
