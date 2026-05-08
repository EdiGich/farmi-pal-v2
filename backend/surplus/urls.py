from django.urls import path

from . import views

urlpatterns = [
    path("surplus/", views.surplus_view, name="surplus"),
]
