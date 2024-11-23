from rest_framework.serializers import ModelSerializer
from . import cloud_context
from .models import *
from rest_framework import serializers


class UserRoleSerializer(ModelSerializer):
    class Meta:
        model = UserRole
        exclude = ['active']


class CommonCitySerializer(ModelSerializer):
    class Meta:
        model = CommonCity
        fields = ["id", "name"]


class CommonDistrictSerializer(ModelSerializer):
    city = CommonCitySerializer()

    class Meta:
        model = CommonDistrict
        fields = ["id", "name", "city"]


class CommonLocationSerializer(ModelSerializer):
    district_info = serializers.SerializerMethodField(source='district')
    city_info = serializers.SerializerMethodField(source='city')

    def get_district_info(self, obj):
        district = obj.district
        if district:
            return {'id': district.id, 'name': district.name}
        else:
            return {}

    def get_city_info(self, obj):
        city = obj.city
        if city:
            return {'id': city.id, 'name': city.name}
        else:
            return {}

    class Meta:
        model = CommonLocation
        fields = ["id", "address", "lat", "lng", "city", 'district', "district_info", "city_info"]
        extra_kwargs = {
            'city': {'write_only': 'true'},
            'city_info': {'read_only': 'true'},
            'district_info': {'read_only': 'true'},
            'district': {'write_only': 'true'}
        }


class UserSerializer(ModelSerializer):
    # role = UserRoleSerializer()
    # location = CommonLocationSerializer()

    def create(self, validated_data):
        user = User(**validated_data)
        print(validated_data.get('role'))
        user.set_password(user.password)
        user.save()

        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data['role'] = UserRole.objects.get(id=data['role']).name
        except:
            data['role'] = None
        return data

    locationGeo = serializers.SerializerMethodField(source="location")

    def get_locationGeo(self, obj):
        location = obj.location
        city = location.city
        district = location.district
        if location:
            return {'lat': location.lat, 'lng': location.lng,
                    'address': location.address,
                    'district': {'id': district.id, 'name': district.name},
                    'city': {'id': city.id, 'name': city.name}}
        else:
            return {}

    avatar_path = serializers.SerializerMethodField(source='avatar')

    def get_avatar_path(self, obj):
        # request = self.context['request']
        # if obj.avatar and not obj.avatar.name.startswith("/static"):
        #     path = '/static/%s' % obj.avatar.name
        #
        #     return request.build_absolute_uri(pathF)
        if obj.avatar:
            path = "{cloud_context}{image_name}".format(cloud_context=cloud_context,
                                                        image_name=obj.avatar)
            return path

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "password",
                  "email", "phone_number", "date_of_birth", "locationGeo",
                  "date_joined", "gender", "avatar_path", "avatar", "is_admin", "role", "location"]
        extra_kwargs = {
            'password': {'write_only': 'true'},
            'avatar_path': {'read_only': 'true'},
            'locationGeo': {'read_only': 'true'},
            'avatar': {'write_only': 'true'},
            'location': {'write_only': 'true'}
        }


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class MedicineSerializer(ModelSerializer):
    class Meta:
        model = Medicine
        fields = ["id", "name", "effect", "contraindications"]


class MedicineUnitSerializer(ModelSerializer):
    image_path = serializers.SerializerMethodField(source='image')
    medicine = MedicineSerializer()

    class Meta:
        model = MedicineUnit
        fields = ["id", "price", "in_stock", "image", "packaging", "medicine", "category", "image_path"]
        extra_kwargs = {
            'image_path': {'read_only': 'true'},
        }

    def get_image_path(self, obj):
        if obj.image:
            path = '{cloud_context}{image_name}'.format(cloud_context=cloud_context, image_name=obj.image)
            return path


class PatientSerializer(ModelSerializer):
    class Meta:
        model = Patient
        exclude = ["created_date", "updated_date"]


class DiagnosisStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = ["id", "sign", "diagnosed"]

class ExaminationSerializer(ModelSerializer):
    patient_id = serializers.IntegerField(write_only=True)

    patient = PatientSerializer(read_only=True)
    user = UserSerializer()
    doctor_info = serializers.SerializerMethodField(source="doctor_availability")
    diagnosis_info = DiagnosisStatusSerializer(many=True, read_only=True, source='diagnosis_set')

    def get_doctor_info(self, obj):
        doctor = obj.doctor_availability
        if doctor:
            doctor_info = doctor.doctor
            if doctor_info:
                return {
                    'id': obj.doctor_availability.id,
                    'email': doctor_info.email,
                    'day': obj.doctor_availability.day,
                    'doctor_id': doctor_info.id,
                    'start_time': doctor.start_time,
                    'end_time': doctor.end_time,
                    'first_name': doctor_info.first_name,
                    'last_name': doctor_info.last_name
                }
        return {}

    def to_internal_value(self, data):
        # Map the patient_id to the patient field
        data['patient'] = {'id': data.pop('patient_id', None)}
        return super().to_internal_value(data)

    class Meta:
        model = Examination
        fields = ["id", "active", "created_date", "updated_date", "description", 'mail_status',
                  'doctor_availability', 'user', 'patient', 'patient_id', 'wage',
                  'reminder_email', 'doctor_info', 'diagnosis_info']
        exclude = []
        extra_kwargs = {
            'doctor_info': {'read_only': 'true'},
            'doctor_availability': {'write_only': 'true'}
        }


class UserNormalSerializer(ModelSerializer):
    locationGeo = serializers.SerializerMethodField(source="location")

    def get_locationGeo(self, obj):
        location = obj.location
        city = location.city
        district = location.district
        if location:
            return {'lat': location.lat, 'lng': location.lng,
                    'district': {'id': district.id, 'name': district.name},
                    'city': {'id': city.id, 'name': city.name}}
        else:
            return {}

    class Meta:
        model = User
        fields = ['id', "first_name", "last_name", "email", "location", "locationGeo"]
        extra_kwargs = {
            'locationGeo': {'read_only': 'true'},
            'location': {'write_only': 'true'}
        }


class PrescribingSerializer(ModelSerializer):
    bill_status = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Prescribing
        exclude = []

    def get_bill_status(self, obj):
        # Assuming 'bill' is the ForeignKey relation from Prescribing to Bill
        bill_instance = obj.bill_set.first()
        if bill_instance:
            return {'id': bill_instance.id, 'amount': bill_instance.amount}
        return None


class DiagnosisSerializer(ModelSerializer):
    examination = ExaminationSerializer()
    user = UserNormalSerializer()
    patient = PatientSerializer()
    prescribing_info = PrescribingSerializer(many=True, read_only=True, source='prescribing_set')

    class Meta:
        model = Diagnosis
        exclude = []


class DiagnosisCRUDSerializer(ModelSerializer):
    class Meta:
        model = Diagnosis
        exclude = []


class PrescriptionDetailCRUDSerializer(ModelSerializer):
    class Meta:
        model = PrescriptionDetail
        exclude = []


class PrescriptionDetailSerializer(ModelSerializer):
    prescribing = PrescribingSerializer()
    medicine_unit = MedicineUnitSerializer()

    class Meta:
        model = PrescriptionDetail
        exclude = []


class BillSerializer(ModelSerializer):
    class Meta:
        model = Bill
        fields = ["id", "amount", "prescribing"]


class DoctorAvailabilitySerializer(ModelSerializer):
    doctor_info = serializers.SerializerMethodField(source='doctor')

    def get_doctor_info(self, obj):
        doctor = obj.doctor
        if doctor:
            return {'id': obj.id, 'email': doctor.email, "doctor_id": doctor.id,
                    'start_time': obj.start_time, 'end_time': obj.end_time,  'day': obj.day,
                    'first_name': doctor.first_name, 'last_name': doctor.last_name}
        else:
            return {}

    class Meta:
        model = DoctorAvailability
        fields = ['id', 'day', 'start_time', 'end_time', 'doctor', 'doctor_info']
        extra_kwargs = {
            'doctor_info': {'read_only': 'true'},
            'doctor': {'write_only': 'true'}
        }


class ExaminationsPairSerializer(ModelSerializer):
    user = UserNormalSerializer()
    patient = PatientSerializer()
    doctor_availability = DoctorAvailabilitySerializer()

    class Meta:
        model = Examination
        fields = ['id', 'user', 'patient', 'description', 'doctor_availability', 'created_date']