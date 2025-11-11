from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pet events/reminders.
    Provides CRUD operations for events.
    """
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only events owned by the current user."""
        return Event.objects.filter(owner=self.request.user).select_related('pet')

    def perform_create(self, serializer):
        """Set the owner to the current user when creating an event."""
        serializer.save(owner=self.request.user)
