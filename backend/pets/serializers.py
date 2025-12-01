from rest_framework import serializers
from .models import Pet, PetPhoto, MatchingPreferences, Swipe, Match


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


class MatchingPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for matching preferences."""

    class Meta:
        model = MatchingPreferences
        fields = [
            'id', 'pet', 'looking_for', 'preferred_personalities',
            'min_age', 'max_age', 'preferred_sizes', 'max_distance',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pet', 'created_at', 'updated_at']


class SwipeSerializer(serializers.ModelSerializer):
    """Serializer for swipe actions."""

    class Meta:
        model = Swipe
        fields = ['id', 'swiper_pet', 'swiped_pet', 'action', 'created_at']
        read_only_fields = ['id', 'created_at']


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for matches."""

    pet1_details = PetSerializer(source='pet1', read_only=True)
    pet2_details = PetSerializer(source='pet2', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'pet1', 'pet2', 'pet1_details', 'pet2_details', 'matched_at', 'is_active']
        read_only_fields = ['id', 'matched_at']


class DiscoveryPetSerializer(serializers.ModelSerializer):
    """Simplified serializer for discovery feed."""

    photos = PetPhotoSerializer(many=True, read_only=True)
    compatibility_score = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = [
            'id', 'name', 'breed', 'age', 'personality',
            'height', 'weight', 'description', 'photos',
            'compatibility_score'
        ]

    def get_compatibility_score(self, obj):
        # This will be calculated in the view
        return getattr(obj, 'compatibility_score', None)
