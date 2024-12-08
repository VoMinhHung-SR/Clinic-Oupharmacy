import APIs, { authApi, endpoints } from "../../../../config/APIs";

export const fetchGetTotalExamsPerDay = async (date) => {
    const res = await APIs.get(endpoints['get-total-exams'], {
        "date": date ? date : ""
    })
    return res;
}

export const fetchChangePassword = async (newPassword, userID) => {
    const res = await authApi().post(endpoints['change-password'](userID), {
        "new_password": newPassword
    })
    return res;
}