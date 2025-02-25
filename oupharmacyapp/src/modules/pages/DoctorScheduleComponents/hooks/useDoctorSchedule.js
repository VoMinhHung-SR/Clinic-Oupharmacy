import { useEffect } from "react"
import { fetchCreateDoctorScheduleByWeek } from "../services"

const useDoctorSchedule = () => {

    useEffect(() => {
        return () => {
            
        }
    }
    , [])

    const onSubmit = (data) => {
        const handleOnSubmit = async () => {
            try{
                const res = await fetchCreateDoctorScheduleByWeek(data)
                if(res.status === 201){
                    console.log('created')
                }
            }catch (err) {
                console.log(err)
            }finally {
                console.log('done')
            }
        }
        handleOnSubmit()
    }

    return{
        onSubmit
    }
}
export default useDoctorSchedule