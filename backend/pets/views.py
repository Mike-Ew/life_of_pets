from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Pet, PetPhoto
from .serializers import PetSerializer, PetPhotoSerializer


class PetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pets.
    Provides CRUD operations for pets.
    """
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only pets owned by the current user."""
        return Pet.objects.filter(owner=self.request.user).prefetch_related('photos')

    def perform_create(self, serializer):
        """Set the owner to the current user when creating a pet."""
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], url_path='upload-photo')
    def upload_photo(self, request, pk=None):
        """Upload a photo for a specific pet."""
        pet = self.get_object()

        serializer = PetPhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(pet=pet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='photos')
    def photos(self, request, pk=None):
        """Get all photos for a specific pet."""
        pet = self.get_object()
        photos = pet.photos.all()
        serializer = PetPhotoSerializer(photos, many=True)
        return Response(serializer.data)
