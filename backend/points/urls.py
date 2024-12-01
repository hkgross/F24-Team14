from django.urls import include, path
from .views import *

urlpatterns = [
    path("", PointsView.as_view(), name="index"),
    path("search/", PointsSearchView.as_view(), name="search"),
    path("sales/", SalesView.as_view(), name="sales"),
    path("sales/sponsor/", SalesBySponsor.as_view(), name="sponsor_sales"),
    path("sales/driver/", SalesByDriver.as_view(), name="driver_sales"),
    path("sales/invoice/", SponsorInvoice.as_view(), name="invoice")
]