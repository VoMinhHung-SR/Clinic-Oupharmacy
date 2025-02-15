
from django.http.multipartparser import MultiPartParser
from rest_framework import viewsets, generics

from mainApp.models import DoctorSchedule
from mainApp.serializers import DoctorScheduleSerializer
from rest_framework.parsers import JSONParser

class DoctorScheduleViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.DestroyAPIView, generics.RetrieveAPIView,
                  generics.UpdateAPIView, generics.ListAPIView):
    queryset = DoctorSchedule.objects.all().order_by('-date')
    serializer_class = DoctorScheduleSerializer
    parser_classes = [JSONParser, MultiPartParser ]