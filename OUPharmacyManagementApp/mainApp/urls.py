from django.urls import path, include
from . import views, views
from rest_framework import routers
from .admin import admin, admin_site, MainAppAdminSite
from . import admin_views

router = routers.DefaultRouter()
router.register("users", views.UserViewSet, basename="user")
router.register("roles", views.UserRoleViewSet, basename="role")
router.register("categories", views.CategoryViewSet, basename="category")
router.register("examinations", views.ExaminationViewSet, basename="examination")
router.register("patients", views.PatientViewSet, basename="patient")
router.register("diagnosis", views.DiagnosisViewSet, basename="diagnosis")
router.register("prescribing", views.PrescribingViewSet, basename="prescribing")
router.register("prescription-details", views.PrescriptionDetailViewSet, basename="prescription-detail")
router.register("medicines", views.MedicineViewSet, basename="medicine")
router.register("medicine-units", views.MedicineUnitViewSet, basename="medicine-unit")
router.register("bills", views.BillViewSet, basename="bill")
router.register("common-districts", views.CommonDistrictViewSet, basename="common-districts")
router.register("common-locations", views.CommonLocationViewSet, basename="common-location")
router.register("doctor-availability", views.DoctorAvailabilityViewSet, basename="doctor-availability")
urlpatterns = [
    path('', include(router.urls)),
    path('oauth2-info/', views.AuthInfo.as_view()),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('admin/', include([
        path('api/revenue_stats/', admin_views.get_admin_revenue),
        path('api/examinations_stats/', admin_views.get_examinations_stats),
        path('api/medicines_stats/', admin_views.get_medicines_stats),
        path('api/doctor_stats/', admin_views.get_doctor_stats),
        path('',  admin_site.urls)
    ])),
    path('stats/', views.StatsView.as_view()),
    path('common-configs/', views.get_all_config)
]
