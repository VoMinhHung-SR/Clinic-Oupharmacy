import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCategoryList = async () => {
    const res = await APIs.get(endpoints['categories'])

    return res
}