import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCreateDoctorScheduleByWeek = async (data) => {
    const res = await APIs.post(endpoints['doctor-create-schedule-weekly'], data)
    return res
}

export const fetchGetDoctorScheduleByWeek = async (weekly_str) => {
    const res = await APIs.get(`${endpoints['doctor-stats']}?${weekly_str}`)
    return res
}