import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCreateDoctorScheduleByWeek = async (data) => {
    const res = await APIs.post(endpoints['doctor-schedule-weekly'], data)
    return res
}
