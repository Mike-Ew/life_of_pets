from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, FeedingScheduleViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'feeding-schedules', FeedingScheduleViewSet, basename='feeding-schedule')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
