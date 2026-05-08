from django.urls import path

from . import views

urlpatterns = [
    path("market/", views.market_view, name="market"),
]
