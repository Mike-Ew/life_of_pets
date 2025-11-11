from django.contrib import admin
from .models import Pet, PetPhoto


class PetPhotoInline(admin.TabularInline):
    """Inline admin for pet photos."""
    model = PetPhoto
    extra = 1
    fields = ['image', 'is_main', 'uploaded_at']
    readonly_fields = ['uploaded_at']


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    """Admin interface for Pet model."""

    list_display = ['name', 'owner', 'breed', 'age', 'personality', 'created_at']
    list_filter = ['personality', 'created_at']
    search_fields = ['name', 'breed', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PetPhotoInline]

    fieldsets = [
        ('Basic Information', {
            'fields': ('owner', 'name', 'breed', 'age')
        }),
        ('Characteristics', {
            'fields': ('personality', 'height', 'weight', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ]


@admin.register(PetPhoto)
class PetPhotoAdmin(admin.ModelAdmin):
    """Admin interface for Pet Photo model."""

    list_display = ['pet', 'is_main', 'uploaded_at']
    list_filter = ['is_main', 'uploaded_at']
    search_fields = ['pet__name']
    readonly_fields = ['uploaded_at']
