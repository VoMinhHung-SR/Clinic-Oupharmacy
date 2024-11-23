import { useTranslation } from "react-i18next"
import { fetchCreateOrUpdatePatient } from "../../modules/pages/BookingComponents/FormAddExamination/services"
import { TOAST_SUCCESS } from "../constants"
import createToastMessage from "../utils/createToastMessage"

const usePatient = () => {
    const {t} = useTranslation(['yup-validate', 'booking'])
    const createPatient = async (userID, patientData, setError, callbackSuccess) => {
        try{
            const dataSubmit = {
                "first_name": patientData.firstName,
                "last_name": patientData.lastName,
                "phone_number": patientData.phoneNumber,
                "email": patientData.email,
                "gender": patientData.gender,
                "date_of_birth": patientData.dateOfBirth,
                "address": patientData.address,
                "user": userID
            }
            const res = await fetchCreateOrUpdatePatient(-1,dataSubmit)
    
            if(res.status === 201){
                callbackSuccess()
                return createToastMessage({message:t('booking:patientCreatedSuccess'), type:TOAST_SUCCESS})
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                const errorData = err.response.data;
                if (errorData.email) {
                    setError("email", {
                        type: "manual",
                        message: errorData.email[0] 
                    });
                }
            } else {
                console.error("An unexpected error occurred:", err.message);
            }
        }
    }

    return{

        createPatient
    }
}

export default usePatient