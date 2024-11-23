import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import SuccessfulAlert, { ConfirmAlert, ErrorAlert } from '../../../../../config/sweetAlert2';
import { REGEX_ADDRESS, REGEX_EMAIL, REGEX_NAME, REGEX_NOTE, REGEX_PHONE_NUMBER, TOAST_ERROR, TOAST_SUCCESS } from '../../../../../lib/constants';
import { featchCreateExamination, fetchCreateOrUpdatePatient, fetchDeleteDoctorAvailabilityTime, fetchExamDateData, fetchUpdateExamination } from '../services';
import moment from 'moment';
import useDebounce from '../../../../../lib/hooks/useDebounce';
import { fetchCreateDoctorWorkingTime, fetchGetDoctorAvailability } from '../../services';
import { splitTime } from '../../../../../lib/utils/helper';
import createToastMessage from '../../../../../lib/utils/createToastMessage';


const useFormAddExamination = () => {
    const {t} = useTranslation(['yup-validate','modal', 'booking']);

    const [openBackdrop, setOpenBackdrop] = useState(false)

    const [date, setDate] = useState('');
    const [doctor, setDoctor] = useState(null);
    const [examinations, setExaminations] = useState([]);
    const [timeNotAvailable, setTimeNotAvailable] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const formAddExaminationSchema = Yup.object().shape({
        firstName: Yup.string().trim()
            .required(t('yupFirstNameRequired'))
            .max(150, t('yupFirstNameMaxLenght'))
            .matches(REGEX_NAME, t('yupFirstNameInvalid')),

        lastName: Yup.string().trim()
            .required(t('yupLastNameRequired'))
            .max(150, t('yupLastNameMaxLenght'))
            .matches(REGEX_NAME, t('yupLastNameInvalid')),

        email: Yup.string().trim()
            .required(t('yupEmailRequired'))
            .max(254, t('yupEmailMaxLenght'))
            .matches(REGEX_EMAIL, t('yupEmailInvalid')),

        phoneNumber: Yup.string().trim()
            .required(t('yupPhoneNumberRequired'))
            .matches(REGEX_PHONE_NUMBER, t('yupPhoneNumberInvalid')),
            
        address: Yup.string().trim()
            .required(t('yupAddressRequired'))
            .matches(REGEX_ADDRESS, t('yupAddressInvalid')),

        dateOfBirth: Yup.string()
            .required(t('yupDOBRequired')),

        gender: Yup.string()
        .required(t('yupGenderRequired')),
    
        description: Yup.string().trim()
            .required(t('yupDescriptionRequired'))
            .max(254, t('yupDescriptionMaxLenght'))
            .matches(REGEX_NOTE, t('yupDescriptionInvalid')),

        doctor: Yup.string().required(t('required')),
        
        selectedTime: Yup.string()
            .required(t('yupCreatedTimeRequired')),

        selectedDate: Yup.string()
            .required(t('yupCreatedDateRequired'))
           
    });


    const debouncedValue = useDebounce(date,500)
    const debouncedValueDoctor = useDebounce(doctor, 500)
    useEffect(() => {
        const getExaminationData = async (date) => {
          try {
            const res = await fetchExamDateData(date);
            if (res.status === 200) {
              setExaminations(res.data.examinations);
            }
          } catch (error) {
            console.error(error);
          }finally {
            // setOpenBackdrop(false)
            setIsLoading(false)
          }
        };
        const getDoctorAvailability = async (date, doctor) => {
            try{
                const res = await fetchGetDoctorAvailability(date, parseInt(doctor))
                if (res.status === 200){
                    setTimeNotAvailable(res.data)
                }
            } catch( err){
                console.log(err)
            }finally {
                // setOpenBackdrop(false)
                setIsLoading(false)
              }
        }

        if(debouncedValueDoctor && debouncedValue){
            setIsLoading(true)
            getDoctorAvailability(debouncedValue, debouncedValueDoctor)
        }
        if (debouncedValue) {
            setIsLoading(true)
          getExaminationData(debouncedValue);
        }
      }, [debouncedValue, debouncedValueDoctor]);




    const shouldDisableTime = (time) => {
        const selectedDate = moment(debouncedValue).format('YYYY-MM-DD');
        const disabledTimesFromData = examinations
            .filter((e) => e.created_date.includes(selectedDate))
            .map((e) => moment(e.created_date).format('HH:mm:ss'));

        const isDisabledRange = (time.hour() >= 0 && time.hour() < 7) || (time.hour() > 17 && time.hour() <= 23);

        return (
            disabledTimesFromData.includes(time.format('HH:mm:ss')) || isDisabledRange
        );
    };


    const handleTimeChange = (date, time) => {

        const timeFormatted = new Date(time);
        
        const selectedDate = moment(date).format('YYYY-MM-DD');
        const selectedTime = moment(timeFormatted).format('HH:mm:ss');

        return new Date(`${selectedDate}T${selectedTime}`)
    };
    


    const onSubmit = async (patientID, data, callback, setError) => {
        if(data === undefined)
            return ErrorAlert(t('modal:errSomethingWentWrong'), t('modal:pleaseTryAgain'), t('modal:ok'));
    
    
        // const createdDate = handleTimeChange(data.selectedDate, data.selectedTime);
        const patientData = {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            date_of_birth: data.dateOfBirth,
            address: data.address,
            gender: data.gender
        }

        const createDoctorWorkingTime = async () => {
            try{

                const { start_time, end_time } = splitTime(data.selectedTime);
    
                const requestData = {
                    doctor: parseInt(data.doctor),
                    day: data.selectedDate,
                    start_time,
                    end_time
                };
                
                const res = await fetchCreateDoctorWorkingTime(requestData)
                
                if(res.status === 201){
                    handleOnSubmit(res.data.id)
                    // return createToastMessage({message:"OKE",type:TOAST_SUCCESS})
                }
            }catch(err){
                console.log(err)
            }

        }

        const handleOnSubmit = async (doctorWorkingTime) => {
            setOpenBackdrop(true)
            // Update done or created patient info
            const res = await fetchCreateOrUpdatePatient(patientID, patientData);
            

            const selectedStartTime = data.selectedTime.split(' - ')[0]; // Extract the first start time
            const combinedDateTime = moment(data.selectedDate + ' ' + selectedStartTime, 'YYYY-MM-DD HH:mm');
            const formattedDateTime = combinedDateTime.format('YYYY-MM-DD HH:mm:ss');
            

            if(res.status === 200 || res.status === 201){
                console.log(res)
                const examinationData = {
                    patient: res.data.id,
                    description: data.description,
                    // created_date: data.createdDate
                    created_date: new Date(formattedDateTime),
                    doctor_availability: doctorWorkingTime
                }
                const resExamination = await featchCreateExamination(examinationData);
                if(resExamination.status === 201){
                    createToastMessage({message:t('modal:createSuccessed'), type:TOAST_SUCCESS})
                    callback();
                }
                else{
                    setOpenBackdrop(false)
                    return ErrorAlert(t('modal:errSomethingWentWrong'), t('modal:pleaseTryAgain'), t('modal:ok'));
                }
                if(resExamination.status === 500){
                    setOpenBackdrop(false)
                    return ErrorAlert(t('modal:errSomethingWentWrong'), t('modal:pleaseTryAgain'), t('modal:ok'));
                }
            }
            else{
                setOpenBackdrop(false)
                return ErrorAlert(t('modal:errSomethingWentWrong'), t('modal:pleaseTryAgain'), t('modal:ok'));
            }
            setOpenBackdrop(false)
        }
        
        return ConfirmAlert(t('booking:confirmBooking'),t('modal:noThrowBack'),t('modal:yes'),t('modal:cancel'),
        // this is callback function when user confirmed "Yes"
        ()=>{
            createDoctorWorkingTime()
        }, () => { return; })
    }

    const onUpdateSubmit = async (examinationID, patientID, data, callback, doctorAvailabilityID) => {
        if(data === undefined)
            return ErrorAlert(t('modal:errSomethingWentWrong'), t('modal:pleaseTryAgain'), t('modal:ok'));
    
    
        // const createdDate = handleTimeChange(data.selectedDate, data.selectedTime);
        const patientData = {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            date_of_birth: data.dateOfBirth,
            address: data.address,
            gender: data.gender
        }


        const deleteCurrentDoctorWorkingTime = async (doctorAvailabilityID) =>{
            try{
                const res = await fetchDeleteDoctorAvailabilityTime(doctorAvailabilityID)
                if(res.status === 204)
                    return createDoctorWorkingTime()
            }catch (err){
                return ErrorAlert("Da co loi xay ra",  "", "OKE")
            }
        } 
        const createDoctorWorkingTime = async () => {
            try{

                const { start_time, end_time } = splitTime(data.selectedTime);
    
                const requestData = {
                    doctor: parseInt(data.doctor),
                    day: data.selectedDate,
                    start_time,
                    end_time
                };
                
                const res = await fetchCreateDoctorWorkingTime(requestData)
                
                if(res.status === 201){
                    handleOnSubmit(res.data.id)
                    // return createToastMessage({message:"OKE",type:TOAST_SUCCESS})
                }
            }catch(err){
                console.log(err)
            }

        }

        const handleOnSubmit = async (doctorWorkingTime) => {
            setOpenBackdrop(true)
            // Update done or created patient info
            const res = await fetchCreateOrUpdatePatient(patientID, patientData);
            

            const selectedStartTime = data.selectedTime.split(' - ')[0]; // Extract the first start time
            const combinedDateTime = moment(data.selectedDate + ' ' + selectedStartTime, 'YYYY-MM-DD HH:mm');
            const  formattedDateTime = combinedDateTime.format('YYYY-MM-DD HH:mm:ss');
            

            if(res.status === 200 || res.status === 201){
                const examinationData = {
                    patient: res.data.id,
                    description: data.description,
                    created_date: new Date(formattedDateTime),
                    doctor_availability: doctorWorkingTime
                }
                const resExamination = await fetchUpdateExamination(examinationID, examinationData);
                if(resExamination.status === 200){
                    createToastMessage({message:t('modal:updateSuccess'), type:TOAST_SUCCESS})
                    callback();
                }
                else{
                    setOpenBackdrop(false)
                    return  createToastMessage({message:t('modal:updateFailed'), type:TOAST_ERROR})
                }
                if(resExamination.status === 500){
                    setOpenBackdrop(false)
                    return createToastMessage({message:t('modal:updateFailed'), type:TOAST_ERROR})
                }
            }
            else{
                setOpenBackdrop(false)
                return  createToastMessage({message:t('modal:updateFailed'), type:TOAST_ERROR})
            }
            setOpenBackdrop(false)
        }
        
        if(doctorAvailabilityID){
               return deleteCurrentDoctorWorkingTime(doctorAvailabilityID)
        }
        else 
           return createDoctorWorkingTime()
    }

    return {
        openBackdrop, examinations, setDate, date, setDate,
        onSubmit, setDoctor, doctor, timeNotAvailable, isLoading,
        onUpdateSubmit,
        formAddExaminationSchema, handleTimeChange, shouldDisableTime
    }
}
export default useFormAddExamination;