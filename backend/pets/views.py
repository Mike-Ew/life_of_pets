from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q, Sum
from datetime import date
from .models import Pet, PetPhoto, MatchingPreferences, Swipe, Match, Activity, FeedingSchedule, Expense
from .serializers import (
    PetSerializer,
    PetPhotoSerializer,
    MatchingPreferencesSerializer,
    SwipeSerializer,
    MatchSerializer,
    DiscoveryPetSerializer,
    ActivitySerializer,
    FeedingScheduleSerializer,
    ExpenseSerializer,
    ExpenseSummarySerializer,
)


def calculate_compatibility(pet1, pet2, preferences=None):
    """
    Calculate compatibility score between two pets.
    Returns a score from 0-100.
    """
    score = 50  # Base score

    # Personality compatibility
    personality_compatibility = {
        'calm': ['calm', 'gentle'],
        'playful': ['playful', 'energetic', 'curious'],
        'curious': ['curious', 'playful'],
        'gentle': ['gentle', 'calm'],
        'energetic': ['energetic', 'playful'],
    }

    if pet2.personality in personality_compatibility.get(pet1.personality, []):
        score += 20

    # Same breed bonus
    if pet1.breed and pet2.breed and pet1.breed.lower() == pet2.breed.lower():
        score += 15

    # Check preferences if available
    if preferences:
        # Preferred personalities
        if preferences.preferred_personalities:
            if pet2.personality in preferences.preferred_personalities:
                score += 10

        # Looking for same thing
        try:
            pet2_prefs = pet2.matching_preferences
            if pet2_prefs.looking_for == preferences.looking_for:
                score += 10
        except MatchingPreferences.DoesNotExist:
            pass

    # Cap the score at 100
    return min(score, 100)


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

    @action(detail=True, methods=['get', 'put', 'patch'], url_path='preferences')
    def preferences(self, request, pk=None):
        """Get or update matching preferences for a pet."""
        pet = self.get_object()

        if request.method == 'GET':
            try:
                prefs = pet.matching_preferences
            except MatchingPreferences.DoesNotExist:
                # Create default preferences if none exist
                prefs = MatchingPreferences.objects.create(pet=pet)
            serializer = MatchingPreferencesSerializer(prefs)
            return Response(serializer.data)

        # PUT or PATCH
        try:
            prefs = pet.matching_preferences
        except MatchingPreferences.DoesNotExist:
            prefs = MatchingPreferences.objects.create(pet=pet)

        partial = request.method == 'PATCH'
        serializer = MatchingPreferencesSerializer(prefs, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DiscoveryView(APIView):
    """Get pets for discovery/matching feed."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pet_id):
        """Get potential matches for a specific pet."""
        try:
            my_pet = Pet.objects.get(id=pet_id, owner=request.user)
        except Pet.DoesNotExist:
            return Response(
                {'error': 'Pet not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get IDs of pets already swiped on
        swiped_pet_ids = Swipe.objects.filter(
            swiper_pet=my_pet
        ).values_list('swiped_pet_id', flat=True)

        # Get IDs of user's own pets
        my_pet_ids = Pet.objects.filter(owner=request.user).values_list('id', flat=True)

        # Get potential matches (exclude own pets and already swiped)
        potential_matches = Pet.objects.exclude(
            Q(id__in=swiped_pet_ids) | Q(id__in=my_pet_ids)
        ).prefetch_related('photos')

        # Get preferences
        try:
            preferences = my_pet.matching_preferences
        except MatchingPreferences.DoesNotExist:
            preferences = None

        # Calculate compatibility scores and sort
        pets_with_scores = []
        for pet in potential_matches:
            pet.compatibility_score = calculate_compatibility(my_pet, pet, preferences)
            pets_with_scores.append(pet)

        # Sort by compatibility score (highest first)
        pets_with_scores.sort(key=lambda x: x.compatibility_score, reverse=True)

        # Limit results
        limit = int(request.query_params.get('limit', 20))
        pets_with_scores = pets_with_scores[:limit]

        serializer = DiscoveryPetSerializer(pets_with_scores, many=True)
        return Response(serializer.data)


class SwipeView(APIView):
    """Handle swipe actions (like/dislike)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pet_id):
        """Create a swipe action."""
        swiped_pet_id = request.data.get('swiped_pet_id')
        action_type = request.data.get('action')

        if not swiped_pet_id or not action_type:
            return Response(
                {'error': 'swiped_pet_id and action are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action_type not in ['like', 'dislike', 'super_like']:
            return Response(
                {'error': 'Invalid action. Must be like, dislike, or super_like'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            my_pet = Pet.objects.get(id=pet_id, owner=request.user)
        except Pet.DoesNotExist:
            return Response(
                {'error': 'Your pet not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            swiped_pet = Pet.objects.get(id=swiped_pet_id)
        except Pet.DoesNotExist:
            return Response(
                {'error': 'Swiped pet not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create or update swipe
        swipe, created = Swipe.objects.update_or_create(
            swiper_pet=my_pet,
            swiped_pet=swiped_pet,
            defaults={'action': action_type}
        )

        response_data = SwipeSerializer(swipe).data
        response_data['is_match'] = False

        # Check for mutual like (match)
        if action_type in ['like', 'super_like']:
            mutual_like = Swipe.objects.filter(
                swiper_pet=swiped_pet,
                swiped_pet=my_pet,
                action__in=['like', 'super_like']
            ).exists()

            if mutual_like:
                # Create match (ensure pet1.id < pet2.id to avoid duplicates)
                if my_pet.id < swiped_pet.id:
                    pet1, pet2 = my_pet, swiped_pet
                else:
                    pet1, pet2 = swiped_pet, my_pet

                match, match_created = Match.objects.get_or_create(
                    pet1=pet1,
                    pet2=pet2
                )

                response_data['is_match'] = True
                response_data['match'] = MatchSerializer(match).data

        return Response(response_data, status=status.HTTP_201_CREATED)


class MatchesView(APIView):
    """Get all matches for a user's pets."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all matches for all of the user's pets."""
        my_pet_ids = Pet.objects.filter(owner=request.user).values_list('id', flat=True)

        matches = Match.objects.filter(
            Q(pet1_id__in=my_pet_ids) | Q(pet2_id__in=my_pet_ids),
            is_active=True
        ).select_related('pet1', 'pet2').prefetch_related(
            'pet1__photos', 'pet2__photos'
        )

        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)


class ActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pet activities."""
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return activities for the user's pets."""
        user_pet_ids = Pet.objects.filter(owner=self.request.user).values_list('id', flat=True)
        queryset = Activity.objects.filter(pet_id__in=user_pet_ids).select_related('pet')

        # Filter by pet if specified
        pet_id = self.request.query_params.get('pet')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)

        # Filter by date if specified
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)

        return queryset

    def perform_create(self, serializer):
        """Validate that the pet belongs to the user."""
        pet = serializer.validated_data.get('pet')
        if pet.owner != self.request.user:
            raise PermissionError("You can only add activities for your own pets.")
        serializer.save()

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        """Get today's activities for all user's pets."""
        user_pet_ids = Pet.objects.filter(owner=request.user).values_list('id', flat=True)
        activities = Activity.objects.filter(
            pet_id__in=user_pet_ids,
            date=date.today()
        ).select_related('pet')
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='log')
    def log_activity(self, request):
        """Log or update today's activity for a pet."""
        pet_id = request.data.get('pet')
        if not pet_id:
            return Response({'error': 'pet is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pet = Pet.objects.get(id=pet_id, owner=request.user)
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=status.HTTP_404_NOT_FOUND)

        activity, created = Activity.objects.update_or_create(
            pet=pet,
            date=date.today(),
            defaults={
                'walking_minutes': request.data.get('walking_minutes', 0),
                'steps': request.data.get('steps', 0),
                'play_minutes': request.data.get('play_minutes', 0),
                'notes': request.data.get('notes', ''),
            }
        )
        serializer = self.get_serializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class FeedingScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing feeding schedules."""
    serializer_class = FeedingScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return feeding schedules for the user's pets."""
        user_pet_ids = Pet.objects.filter(owner=self.request.user).values_list('id', flat=True)
        queryset = FeedingSchedule.objects.filter(pet_id__in=user_pet_ids).select_related('pet')

        # Filter by pet if specified
        pet_id = self.request.query_params.get('pet')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)

        return queryset

    def perform_create(self, serializer):
        """Validate that the pet belongs to the user."""
        pet = serializer.validated_data.get('pet')
        if pet.owner != self.request.user:
            raise PermissionError("You can only add feeding schedules for your own pets.")
        serializer.save()


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing expenses."""
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return expenses for the user."""
        queryset = Expense.objects.filter(owner=self.request.user).select_related('pet')

        # Filter by pet if specified
        pet_id = self.request.query_params.get('pet')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)

        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        """Set owner and validate pet ownership."""
        pet = serializer.validated_data.get('pet')
        if pet and pet.owner != self.request.user:
            raise PermissionError("You can only add expenses for your own pets.")
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Get expense summary by category."""
        queryset = self.get_queryset()

        # Group by category and sum
        summary = queryset.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')

        # Calculate grand total
        grand_total = sum(item['total'] for item in summary)

        return Response({
            'categories': list(summary),
            'total': grand_total
        })
