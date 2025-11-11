from rest_framework import serializers
from .models import Pet, PetPhoto


class PetPhotoSerializer(serializers.ModelSerializer):
    """Serializer for pet photos."""

    class Meta:
        model = PetPhoto
        fields = ['id', 'image', 'is_main', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class PetSerializer(serializers.ModelSerializer):
    """Serializer for pet details."""

    photos = PetPhotoSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Pet
        fields = [
            'id', 'owner', 'owner_username', 'name', 'breed', 'age',
            'personality', 'height', 'weight', 'description',
            'photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set the owner to the current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
