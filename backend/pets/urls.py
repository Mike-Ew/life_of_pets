from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PetViewSet,
    DiscoveryView,
    SwipeView,
    MatchesView,
    ActivityViewSet,
    FeedingScheduleViewSet,
    ExpenseViewSet,
)

router = DefaultRouter()
router.register(r'', PetViewSet, basename='pet')

urlpatterns = [
    # Discovery and matching endpoints
    path('discover/<int:pet_id>/', DiscoveryView.as_view(), name='discovery'),
    path('<int:pet_id>/swipe/', SwipeView.as_view(), name='swipe'),
    path('matches/', MatchesView.as_view(), name='matches'),
    # PetViewSet routes (CRUD for pets at /api/pets/)
    path('', include(router.urls)),
]
