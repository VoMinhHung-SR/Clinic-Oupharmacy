import APIs, { authApi, endpoints } from "../../../../config/APIs"

export const fetchCategoryList = async () => {
    const res = await APIs.get(endpoints['categories'])

    return res
}

export const fetchCreateCategory = async (name) => {
    const res = await authApi().post(endpoints['categories'], {name})
    return res
}