import datetime
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from mainApp.models import DoctorSchedule, TimeSlot
from mainApp.serializers import DoctorScheduleSerializer, TimeSlotSerializer
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.decorators import action
class DoctorScheduleViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.DestroyAPIView, generics.RetrieveAPIView,
                  generics.UpdateAPIView, generics.ListAPIView):
    queryset = DoctorSchedule.objects.all().order_by('-date')
    serializer_class = DoctorScheduleSerializer
    parser_classes = [JSONParser, MultiPartParser]

    @action(methods=['post'], detail=False, url_path='schedule')
    def get_schedule_by_date(self, request):
        date_str = request.data.get('date')
        doctor_id = request.data.get('doctor')
        try:
            if date_str and doctor_id:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                doctor_data = DoctorSchedule.objects.filter(doctor=doctor_id, date=date).all()
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST,
                                data={"errMsg": "Can't get data, doctor or date is false"})

        except Exception as error:
            print(error)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            data={"errMsg": "Cant get data doctor or date is false"})

        if doctor_data:
            if doctor_data:
                doctor_data_serialized = DoctorScheduleSerializer(doctor_data, context={'request': request},
                                                                  many=True).data
                for doctor in doctor_data_serialized:
                    time_slots = TimeSlot.objects.filter(schedule=doctor['id']).all()
                    doctor['time_slots'] = TimeSlotSerializer(time_slots, context={'request': request}, many=True).data

                return Response(
                    data=doctor_data_serialized,
                    status=status.HTTP_200_OK
                )
        return Response(data=[], status=status.HTTP_200_OK)