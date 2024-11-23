import datetime
import http
import math
import os
import uuid
import json
import urllib.request
import urllib
import uuid
from collections import deque
from crypt import methods
from datetime import timedelta
from pickle import FALSE

from django.db.models.functions import TruncDate
from django.utils import timezone
import requests
import hmac
import hashlib
from time import time
import random
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count, DateTimeField
from django.http import HttpResponseRedirect
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, generics
from rest_framework import permissions
from rest_framework import views

from rest_framework import filters

from .constant import MAX_EXAMINATION_PER_DAY, ROLE_DOCTOR, ROLE_NURSE
from .filters import ExaminationFilter, RecipientsFilter, DiagnosisFilter
from .permissions import *
from django.core.mail import send_mail, EmailMessage
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import *
from .paginator import BasePagination, ExaminationPaginator, MedicineUnitPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.parsers import JSONParser
from apscheduler.schedulers.background import BackgroundScheduler
import requests
from .tasks import job_send_email_re_examination, load_waiting_room

# Create your views here.
wageBooking = 20000


class AuthInfo(APIView):
    def get(self, request):
        return Response(settings.OAUTH2_INFO, status=status.HTTP_200_OK)


class CommonLocationViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView,
                            generics.CreateAPIView, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = CommonLocation.objects.all()
    serializer_class = CommonLocationSerializer
    parser_classes = [JSONParser, MultiPartParser]


class CommonDistrictViewSet(viewsets.ViewSet):
    serializers = CommonDistrictSerializer

    @action(methods=['post'], detail=False, url_path='get-by-city')
    def get_by_city(self, request):
        try:
            districts = CommonDistrict.objects.filter(city_id=request.data.get('city')).all()
        except Exception as ex:
            return Response(data={"errMgs": "District have some errors"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(data=CommonDistrictSerializer(districts, many=True).data,
                        status=status.HTTP_200_OK)


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView,
                  generics.UpdateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [JSONParser, MultiPartParser, ]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    filterset_class = RecipientsFilter

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'get_patients']:
            return [UserPermission()]
        if self.action in ['get_examinations','change_password']:
            return [OwnerExaminationPermission()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = self.queryset
        kw = self.request.query_params.get('kw')
        if kw:
            queryset = queryset.filter(username__icontains=kw)
        return queryset

    @action(methods=['get'], detail=False, url_path='current-user')
    def get_current_user(self, request):
        return Response(self.serializer_class(request.user, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['get'], detail=True, url_path='booking-list', pagination_class=ExaminationPaginator)
    def get_examinations(self, request, pk):
        examinations = Examination.objects.filter(user=pk).all()
        paginator = ExaminationPaginator()
        page_size = request.query_params.get('page_size',
                                             10)  # Set the default page size to 10 if not specified in the URL
        paginator.page_size = page_size
        result_page = paginator.paginate_queryset(examinations, request)
        serializer = ExaminationSerializer(result_page, context={'request': request}, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(methods=['get'], detail=True, url_path='location-info')
    def get_user_location_info(self, request, pk):
        user = self.get_object()
        location_id = user.location_id
        try:
            location = CommonLocation.objects.get(id=location_id)
            # Access the location properties
            print(location.address, location.id)
            return Response(status=status.HTTP_200_OK, data=CommonLocationSerializer(location).data)
        except CommonLocation.DoesNotExist:
            # Handle the case when the location with the given ID doesn't exist
            return Response(status=status.HTTP_404_NOT_FOUND, data=[])

    @action(methods=['get'], detail=False, url_path='demo')
    def demo (self, request):
        try:
            # job_send_email_re_examination.delay()
            load_waiting_room.delay()
            # res = requests.get('https://rsapi.goong.io/Direction', params={
            #     'origin': '10.816905962180005,106.6786961439645',
            #     'destination': '10.793500150986223,106.67777364026149',
            #     'vehicle': 'car',
            #     'api_key': 'SGj019RWMrUGpd9XYy7qmSeRYbbvEFkOaPnmB49N'
            # })
        except Exception as ex:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=[])
        return Response(status=status.HTTP_200_OK, data=[])

    @action(methods=['post'], detail=True, url_path='change-password')
    def change_password(self, request, pk):
        user = self.get_object()
        try:
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.save()
        except Exception as ex:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True, url_path='get-patients')
    def get_patients(self, request, pk):
        user = self.get_object()
        try:
            patients = Patient.objects.filter(user=user).all()
        except Exception as ex:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=[])

        if patients:
            return Response(
                data=PatientSerializer(patients, context={'request': request}, many=True).data,
                status=status.HTTP_200_OK)
        return Response(data=[], status=status.HTTP_200_OK)

class DoctorAvailabilityViewSet(viewsets.ViewSet, generics.ListAPIView, generics.DestroyAPIView,
                         generics.UpdateAPIView, generics.RetrieveAPIView, generics.CreateAPIView):
    queryset = DoctorAvailability.objects.all().order_by('start_time')
    serializer_class = DoctorAvailabilitySerializer
    parser_classes = [JSONParser, MultiPartParser, ]

    @action(methods=['post'], detail=False, url_path='get-doctor-availability')
    def get_doctor_availability(self, request):
        date_str = request.data.get('date')
        doctor_id = request.data.get('doctor')
        try:
            if date_str and doctor_id:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
                doctor_data = DoctorAvailability.objects.filter(doctor=doctor_id, day=date).all().order_by('start_time')
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST,
                                data={"errMsg": "Can't get data, doctor or date is false"})

        except Exception as error:
            print(error)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={"errMsg": "Cant get data doctor or date is false"})

        if doctor_data:
            return Response(data=DoctorAvailabilitySerializer(doctor_data, context={'request': request}, many=True).data,
                            status=status.HTTP_200_OK)
        return Response(data=[], status=status.HTTP_200_OK)


class ExaminationViewSet(viewsets.ViewSet, generics.ListAPIView,
                         generics.RetrieveAPIView,
                         generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Examination.objects.filter(active=True).order_by('-created_date')
    serializer_class = ExaminationSerializer
    pagination_class = ExaminationPaginator
    ordering_fields = '__all__'
    filterset_class = ExaminationFilter
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    permissions = [permissions.AllowAny()]

    # def get_queryset(self):
    #     queryset = self.queryset
    #
    #     # Your custom filtering logic goes here
    #     kw_param = self.request.query_params.get('kw')
    #     status_param = self.request.query_params.get('status')
    #
    #     if kw_param:
    #         queryset = queryset.filter(user__email=kw_param)
    #
    #     if status_param is not None:
    #         queryset = queryset.filter(mail_status=status_param)
    #
    #     return queryset

    def create(self, request):
        user = request.user
        if user:
            try:
                patient = Patient.objects.get(pk=request.data.get('patient'))
                description = request.data.get('description')
                created_date = request.data.get('created_date')
                doctor_availability = DoctorAvailability.objects.get(pk=request.data.get('doctor_availability'))
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            if patient:
                current_day = timezone.now()
                max_examinations = MAX_EXAMINATION_PER_DAY
                today_utc = current_day.replace(hour=0, minute=0, second=0).astimezone(pytz.utc)
                tomorrow_utc = current_day.replace(hour=23, minute=59, second=59).astimezone(pytz.utc)

                if Examination.objects.filter(created_date__range=(today_utc, tomorrow_utc)).count() > max_examinations:
                    return Response(data={"errMsg": "Maximum number of examinations reached"},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    e = Examination.objects.create(description=description, patient=patient,
                                                   user=user, doctor_availability=doctor_availability)
                    if created_date:
                        e.created_date = created_date
                    e.save()
                    return Response(ExaminationSerializer(e, context={'request': request}).data,
                                    status=status.HTTP_201_CREATED)
                except:
                    return Response(data={"errMsg": "Error occurred while creating examination"},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            else:
                return Response(data={"errMgs": "Patient doesn't exist"},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={"errMgs": "User not found"},
                            status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk=None):
        user = request.user
        if user:
            try:
                patient = Patient.objects.get(pk=request.data.get('patient'))
                description = request.data.get('description')
                created_date = request.data.get('created_date')
                doctor_availability = DoctorAvailability.objects.get(pk=request.data.get('doctor_availability'))
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            if patient:
                try:
                    e = self.get_object(pk)
                    if created_date:
                        e.created_date = created_date
                    e.description = description
                    e.patient = patient
                    e.user = user
                    e.doctor_availability = doctor_availability
                    e.save()
                    return Response(ExaminationSerializer(e, context={'request': request}).data,
                                    status=status.HTTP_200_OK)
                except:
                    return Response(data={"errMsg": "Error occurred while updating examination"},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response(data={"errMsg": "Patient doesn't exist"},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data={"errMsg": "User not found"},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='send_mail')
    def send_email(self, request, pk):
        examination = self.get_object()
        error_msg = None
        if examination:
            if not examination.mail_status:
                user = examination.user
                patient = examination.patient
                if user and patient:
                    try:
                        current_date = datetime.date.today().strftime('%d-%m-%Y')
                        subject = "Thư xác nhận lịch đăng ký khám"
                        to_user = user.email
                        content = """Xin chào {0},
Phiếu đặt lịch của bạn đã được xác nhận vào ngày {6}, bạn có một lịch hẹn khám vơi OUPharmacy vào ngày {4:%d-%m-%Y}!!!
                
Chi tiết lịch đặt khám của {0}:
(+)  Mã đặt lịch: {1}
(+)  Họ tên bệnh nhân: {2}
(+)  Mô tả: {3}
(+)  Ngày đăng ký:{4:%d-%m-%Y}
=====================
(-)  Phí khám của bạn là: {5:,.0f} VND
                                
Địa điểm: 371 Nguyễn Kiệm, Phường 3, Gò Vấp, Thành phố Hồ Chí Minh
    
                                
Vui lòng xem kỹ lại thông tin thời gian và địa diểm, để hoàn tất thủ tục khám.
OUPharmacy xin chúc bạn một ngày tốt lành và thật nhiều sức khỏe, xin chân thành cả́m ơn.""".format(user.first_name + " " + user.last_name,
                                                                                                     examination.pk,
                                                                                                     patient.first_name + " " + patient.last_name,
                                                                                                     examination.description,
                                                                                                     examination.created_date,
                                                                                                     examination.wage,
                                                                                                     current_date)
                        if content and subject and to_user:
                            send_email = EmailMessage(subject, content, to=[to_user])
                            send_email.send()
                        else:
                            error_msg = "Send mail failed !!!"
                    except:
                        error_msg = 'Email content error!!!'
                else:
                    error_msg = 'User and patient not found !!!'
            else:
                error_msg = 'Email was sent already!!!'
        if not error_msg:
            examination.mail_status = True
            examination.save()
            return Response(data={
                'status': 'Send mail successfully',
                'to': to_user,
                'subject': subject,
                'content': content
            }, status=status.HTTP_200_OK)
        return Response(data={'errMgs': error_msg},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, url_path='send_email_remind1')
    def send_email_remind1(self, request, pk):
        examination = self.get_object()
        if not examination:
            return Response(data={'errMsg': 'Examination not found'},
                            status=status.HTTP_404_NOT_FOUND)
        user = examination.user
        patient = examination.patient
        doctor_availability = examination.doctor_availability
        if not user or not patient:
            return Response(data={'errMsg': 'User or patient not found'},
                            status=status.HTTP_400_BAD_REQUEST)
        seconds = request.data.get('seconds')/60
        minutes = math.ceil(int(seconds))
        subject = "Thông báo: phiếu đăng ký khám của bạn sắp bắt đầu"
        to_user = user.email
        content = f"""Xin chào {user.first_name} {user.last_name},
Phiếu khám của bạn sẽ bắt đầu sau: {minutes} phút.

Bệnh nhân {patient.first_name} {patient.last_name} của bạn có lịch khám với chúng tôi vào ngày {doctor_availability.day:%d-%m-%Y}.

Chi tiết lịch đặt khám của bạn:
(+)  Mã đặt lịch: {examination.pk}
(+)  Họ tên bệnh nhân: {patient.first_name} {patient.last_name}
(+)  Mô tả: {examination.description}
(+)  Ngày đăng ký: {doctor_availability.day:%d-%m-%Y}
=====================
(-)  Phí khám của bạn là: {examination.wage:,.0f} VND

Địa điểm: 371 Nguyễn Kiệm, Phường 3, Gò Vấp, Thành phố Hồ Chí Minh

Vui lòng xem kỹ lại thông tin thời gian và địa điểm, để hoàn tất thủ tục khám.
OUPharmacy xin chúc bạn một ngày tốt lành và thật nhiều sức khỏe, xin chân thành cả́m ơn."""
        try:
            send_email = EmailMessage(subject, content, to=[to_user])
            send_email.send()
        except:
            return Response(data={'errMsg': 'Failed to send email'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        examination.mail_status = True
        examination.save()
        return Response(data={
            'status': 'Send mail successfully',
            'to': to_user,
            'subject': subject,
            'content': content
        }, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True, url_path='get-diagnosis')
    def get_diagnosis(self, request, pk):
        try:
            diagnosis = Diagnosis.objects.filter(examination_id=pk)
        except Exception as ex:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            data={"errMgs": "prescription not found"})
        if diagnosis:
            return Response(DiagnosisSerializer(diagnosis.first(), context={'request': request}).data,
                            status=status.HTTP_200_OK)
        return Response(data={}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='get-total-exams')
    def get_total_exam_per_day(self, request):
        date_str = request.data.get('date')
        try:
            if date_str:
                date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                date = datetime.datetime.now().date()
            start_of_day = datetime.datetime.combine(date, datetime.time.min).astimezone(pytz.utc)
            end_of_day = datetime.datetime.combine(date, datetime.time.max).astimezone(pytz.utc)
            examinations = Examination.objects.filter(created_date__range=(start_of_day, end_of_day)).all()
        except Exception as error:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={"errMsg": "Can't get Examinations"})
        return Response(data={"totalExams": len(examinations), "dateStr": date, 
                              "examinations": ExaminationSerializer(examinations,
                                                                    context={'request': request}, many=True).data},
                        status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False, url_path='get-list-exam-today')
    def get_list_exam_today(self, request):
        try:
            now = datetime.datetime.now()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(pytz.utc)
            tomorrow = now.replace(hour=23, minute=59, second=59).astimezone(pytz.utc)
            examinations = Examination.objects.filter(created_date__range=(today,
                                                                           tomorrow)).order_by('created_date').all()
        except Exception as error:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            data={"errMgs": "Can't get Examinations"})
        if examinations:
            return Response(data=ExaminationsPairSerializer(examinations, context={'request': request}, many=True).data,
                            status=status.HTTP_200_OK)
        return Response(data=[],
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='get-list-doctor-exams-today')
    def get_list_doctor_exams(self, request):
        try:
            request_data = request.data
            request_date = request_data.get('date')

            if request_date:
                # Use the provided date from the request body
                examination_date = datetime.datetime.strptime(request_date, '%Y-%m-%d').date()
            else:
                # Use today's date as the default
                examination_date = timezone.now().date()

            examinations = Examination.objects.filter(doctor_availability__day=examination_date)

            return Response(
                data=ExaminationsPairSerializer(examinations, context={'request': request}, many=True).data,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PatientViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView,
                     generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = Patient.objects.filter(active=True)
    serializer_class = PatientSerializer
    pagination_class = BasePagination
    parser_classes = [JSONParser, MultiPartParser, ]

    @action(methods=['post'], detail=False, url_path='get-patient-by-email')
    def get_patient_by_email(self, request):
        user = request.user
        if user:
            try:
                email = request.data.get('email')
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            if email:
                try:
                    patient = Patient.objects.get(email=email)
                except Patient.DoesNotExist:
                    return Response(data={"patient": None},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response(PatientSerializer(patient, context={'request': request}).data,
                                status=status.HTTP_200_OK)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(data={"errMgs": "User not found"},
                        status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.UpdateAPIView,
                      generics.DestroyAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer


class MedicineViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                      generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Medicine.objects.filter(active=True)
    serializer_class = MedicineSerializer
    pagination_class = BasePagination


class MedicineUnitViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                          generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = MedicineUnit.objects.filter(active=True).order_by('medicine__name')
    serializer_class = MedicineUnitSerializer
    pagination_class = MedicineUnitPagination
    parser_classes = [JSONParser, MultiPartParser]


class DiagnosisViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                       generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Diagnosis.objects.filter(active=True).order_by('-created_date')
    serializer_class = DiagnosisSerializer
    parser_classes = [JSONParser, MultiPartParser]
    pagination_class = ExaminationPaginator
    ordering_fields = '__all__'
    filterset_class = DiagnosisFilter
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]

    def create(self, request, *args, **kwargs):
        serializer = DiagnosisCRUDSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(methods=['POST'], detail=False, url_path='get-medical-records')
    def get_patient_medical_records(self, request):
        try:
            medical_records = Diagnosis.objects.filter(patient=int(request.data.get('patientId'))).all()\
                .order_by('-created_date')
        except Exception as ex:
            print(ex)
            return Response(data={"errMgs": "Can not get patient's medical records"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if medical_records:
            return Response(data=DiagnosisSerializer(medical_records, context={'request': request}, many=True).data,
                            status=status.HTTP_200_OK)
        return Response(data=[], status=status.HTTP_200_OK)


class PrescriptionDetailViewSet(viewsets.ViewSet, generics.RetrieveAPIView,
                                generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = PrescriptionDetail.objects.filter(active=True)
    serializer_class = PrescriptionDetailCRUDSerializer
    parser_classes = [JSONParser, MultiPartParser]

    def get_parsers(self):
        if getattr(self, 'swagger_fake_view', False):
            return []

        return super().get_parsers()


class StatsView(views.APIView):
    def get(self, request):
        year = request.GET.get('year')

        stats = Bill.objects
        if year:
            year = int(year)
            stats = stats.filter(created_date__year=year)

        stats = stats.values('prescribing__diagnosis__examination__id', 'amount').annotate(
            count=Count('prescribing__diagnosis__examination__id'))
        return Response(data=stats, status=status.HTTP_200_OK)

    def post(self, request):
        quarter_one = request.POST.get('quarterOne')
        year = request.POST.get('year')

        stats = Bill.objects

        if quarter_one:
            quarter_one = int(quarter_one)
            if quarter_one == 1:
                stats = stats.filter(apply_date__month__range=[1, 3])
            elif quarter_one == 2:
                stats = stats.filter(apply_date__month__range=[4, 6])
            elif quarter_one == 3:
                stats = stats.filter(apply_date__month__range=[7, 9])
            elif quarter_one == 4:
                stats = stats.filter(apply_date__month__range=[10, 12])

        if year:
            stats = stats.filter(apply_date__year=year)
        stats = stats \
            .values('job_post__career__id', 'job_post__career__career_name') \
            .annotate(count=Count('job_post__career__id'))

        return Response(data=stats, status=status.HTTP_200_OK)


class BillViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.DestroyAPIView, generics.RetrieveAPIView,
                  generics.UpdateAPIView, generics.ListAPIView):
    queryset = Bill.objects.filter(active=True)
    serializer_class = BillSerializer
    parser_classes = [JSONParser, MultiPartParser]

    def get_parsers(self):
        if getattr(self, 'swagger_fake_view', False):
            return []

        return super().get_parsers()

    @action(methods=['POST'], detail=False, url_path='get-bill-by-pres')
    def get_bill_by_pres(self, request):
        user = request.user
        if user:
            try:
                prescribing = request.data.get('prescribing')
            except:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if prescribing:
                try:
                    bill = Bill.objects.get(prescribing=prescribing)
                except:
                    return Response(data=[],
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response(BillSerializer(bill, context={'request': request}).data,
                                status=status.HTTP_200_OK)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(data={"errMgs": "User not found"},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['GET'], detail=False, url_path='bill_status')
    def get_bill_status(self, request):
        try:
            prescribing_id = Prescribing.objects.get(id=int(request.GET['prescribingId']))

            examination_id = prescribing_id.diagnosis.examination.id
            if request.GET['resultCode'] != str(0):
                return HttpResponseRedirect(redirect_to=os.getenv('CLIENT_SERVER')+'/examinations/' + str(examination_id) + '/payments')
            else:
                Bill.objects.create(prescribing=prescribing_id, amount=float(request.GET['amount']))
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            data={'errMgs': 'prescriptionId or examinationId not found'})

        return HttpResponseRedirect(redirect_to=os.getenv('CLIENT_SERVER')+'/examinations/' + str(examination_id) + '/payments')

    @action(methods=['POST'], detail=False, url_path='momo-payments')
    def momo_payments(self, request):
        prescribing = str(request.data.get('prescribing'))

        endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        partnerCode = "MOMOPZQO20220908"
        accessKey = "YCyiVT9bM5fS3W72"
        secretKey = "v2srvmKzz6f5wVht5OwcXWErUhBdn4tq"
        orderInfo = "Pay with MoMo"
        # Redirect Server URL
        redirectUrl = os.getenv('SERVER') + "/bills/bill_status?prescribingId="+prescribing
        # Redirect Client URL
        ipnUrl = os.getenv('SERVER') + "/bills/bill_status/"
        amount = str(request.data.get('amount'))
        orderId = str(uuid.uuid4())
        requestId = str(uuid.uuid4())
        requestType = "captureWallet"
        extraData = ""  # pass empty value or Encode base64 JsonString

        # before sign HMAC SHA256 with format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl
        # &orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId
        # &requestType=$requestType
        rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType

        # puts raw signature
        print("--------------------RAW SIGNATURE----------------")
        print(rawSignature)
        # signature
        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()
        print("--------------------SIGNATURE----------------")
        print(signature)

        # json object send to MoMo endpoint

        data = {
            'partnerCode': partnerCode,
            'partnerName': "Test",
            'storeId': "MomoTestStore",
            'requestId': requestId,
            'amount': amount,
            'prescribingId': prescribing,
            'orderId': orderId,
            'orderInfo': orderInfo,
            'redirectUrl': redirectUrl,
            'ipnUrl': ipnUrl,
            'lang': "vi",
            'extraData': extraData,
            'requestType': requestType,
            'signature': signature
        }
        print("--------------------JSON REQUEST----------------\n")
        data = json.dumps(data)
        print(data)

        clen = len(data)
        response = requests.post(endpoint, data=data,
                                 headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})

        # f.close()
        print("--------------------JSON response----------------\n")
        print(response.json())

        user = request.user
        if user:
            return Response(data={"payUrl": response.json()['payUrl']}, status=status.HTTP_200_OK)

        return Response(data={'errMgs': "User not found"},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False, url_path='zalo-payments')
    def zalo_payments(self, request):
        config = {
            "app_id": 2553,
            "key1": "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
            "key2": "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
            "endpoint": "https://sb-openapi.zalopay.vn/v2/create",
            "callback_url": 'http://localhost:5173/',
        }
        transID = random.randrange(1000000)
        order = {
            "app_id": config["app_id"],
            "app_trans_id": "{:%y%m%d}_{}".format(datetime.datetime.today(), transID),  # mã giao dich có định dạng yyMMdd_xxxx
            "app_user": "user123",
            "app_time": int(round(time() * 1000)),  # miliseconds
            "embed_data": json.dumps({}),
            "item": json.dumps([{}]),
            "amount": request.data.get('amount'),
            "callback_url": config["callback_url"],
            "description": "Lazada - Payment for the order #" + str(transID),
            "bank_code": "zalopayapp"

        }

        # app_id|app_trans_id|app_user|amount|apptime|embed_data|item
        data = "{}|{}|{}|{}|{}|{}|{}".format(order["app_id"], order["app_trans_id"], order["app_user"],
                                             order["amount"], order["app_time"], order["embed_data"], order["item"])
        print("-------------------- Data ----------------\n")
        print(data)
        order["mac"] = hmac.new(config['key1'].encode(), data.encode(), hashlib.sha256).hexdigest()
        print(order["mac"])
        response = urllib.request.urlopen(url=config["endpoint"], data=urllib.parse.urlencode(order).encode())
        result = json.loads(response.read())

        print("-------------------- Result  ----------------\n")
        print(result)
        for k, v in result.items():
            print("{}: {}".format(k, v))

        return Response(data={"order_url": result['order_url'], 'order_token': result['order_token']},
                        status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(data={'message': "Login successfully"},
                            status=status.HTTP_202_ACCEPTED)
        else:
            return Response(data={'error_msg': "Invalid user"},
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_200_OK)


class UserRoleViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                      generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = UserRole.objects.filter(active=True)
    serializer_class = UserRoleSerializer


class PrescribingViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView,
                         generics.UpdateAPIView, generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Prescribing.objects.filter(active=True)
    serializer_class = PrescribingSerializer
    pagination_class = ExaminationPaginator

    @action(methods=['POST'], detail=False, url_path='get-by-diagnosis')
    def get_by_diagnosis(self, request):
        user = request.user
        if user:
            try:
                prescribing = Prescribing.objects.filter(diagnosis=request.data.get('diagnosis')).all()
            except:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if prescribing:
                return Response(data=PrescribingSerializer(prescribing, many=True,
                                context={'request': request}).data,
                                status=status.HTTP_200_OK)
            return Response(status=status.HTTP_200_OK, data=[])
        return Response(data={"errMgs": "User not found"},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=True, url_path='get-pres-detail')
    def get_prescription_detail(self, request, pk):
        prescription_detail = PrescriptionDetail.objects.filter(prescribing=pk).all()

        return Response(data=PrescriptionDetailSerializer(prescription_detail, many=True,
                                                          context={'request': request}).data,
                        status=status.HTTP_200_OK)


@api_view(http_method_names=["GET"])
def get_all_config(request):
    try:
        # database
        cities = CommonCity.objects.values("id", "name")
        roles = UserRole.objects.values("id", "name")
        nurses = User.objects.filter(role__name=ROLE_NURSE,is_active=True)
        doctors = User.objects.filter(role__name=ROLE_DOCTOR, is_active=True)
        categories = Category.objects.filter(active=True).values("id", "name")

        doctors_data = [
            {
                "id": doctor.id,
                "email": doctor.email,
                "first_name": doctor.first_name,
                "last_name": doctor.last_name,
                "avatar": doctor.avatar.url if doctor.avatar else None  # Get avatar URL if available
            }
            for doctor in doctors
        ]
        nurses_data = [
            {
                "id": nurse.id,
                "email": nurse.email,
                "first_name": nurse.first_name,
                "last_name": nurse.last_name,
                "avatar": nurse.avatar.url if nurse.avatar else None  # Get avatar URL if available
            }
            for nurse in nurses
        ]

        res_data = {
            "cityOptions": cities,
            "roles": roles,
            "doctors": doctors_data,
            "nurses": nurses_data,
            "categories": categories
        }

    except Exception as ex:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data={"errMgs": "value Error"})
    else:
        return Response(data=res_data, status=status.HTTP_200_OK)

