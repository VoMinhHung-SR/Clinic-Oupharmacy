import APIs, { endpoints } from "../../../../config/APIs";

export const fetchGetTotalExamsPerDay = async (date) => {
    const res = await APIs.get(endpoints['get-total-exams'], {
        "date": date ? date : ""
    })
    return res;
} 