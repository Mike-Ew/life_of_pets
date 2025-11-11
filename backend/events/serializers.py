from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Serializer for event details."""

    pet_name = serializers.CharField(source='pet.name', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'owner', 'owner_username', 'pet', 'pet_name',
            'title', 'event_type', 'description', 'event_date',
            'send_reminder', 'reminder_sent_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'reminder_sent_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set the owner to the current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

    def validate_pet(self, value):
        """Ensure user can only create events for their own pets."""
        if value.owner != self.context['request'].user:
            raise serializers.ValidationError("You can only create events for your own pets.")
        return value
