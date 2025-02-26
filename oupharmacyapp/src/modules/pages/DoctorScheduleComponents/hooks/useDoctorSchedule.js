import { useEffect } from "react"
import { fetchCreateDoctorScheduleByWeek } from "../services"
import createToastMessage from "../../../../lib/utils/createToastMessage"
import { TOAST_SUCCESS } from "../../../../lib/constants"
import { useTranslation } from "react-i18next"
import SuccessfulAlert, { ConfirmAlert } from "../../../../config/sweetAlert2"

const useDoctorSchedule = () => {

    const {t} = useTranslation(['modal', 'doctor-schedule']);

    useEffect(() => {}, [])

    const onSubmit = (data) => {
        const handleOnSubmit = async () => {
            try{
                const res = await fetchCreateDoctorScheduleByWeek(data)
                if(res.status === 201){
                    SuccessfulAlert(t('modal:createSuccess'), t('modal:ok'), () => {});
                }
            }catch (err) {
                console.log(err)
            }
        }

        return ConfirmAlert(t('doctor-schedule:confirmCreateSchedule'), t('modal:noThrowBack'), t('modal:ok'),t('modal:cancel'), 
        ()=> {
            handleOnSubmit();
        }, ()=>{})
     
    }

    return{
        onSubmit
    }
}
export default useDoctorSchedule