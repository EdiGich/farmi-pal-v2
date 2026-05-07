from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health_view, name="health"),
    path("diagnose/", views.diagnosis_view, name="diagnosis"),
]
