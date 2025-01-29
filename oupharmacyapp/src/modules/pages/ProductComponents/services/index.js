import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCreateMedicine = async ({name, effect, contraindications}) => {
    const res = await APIs.post(endpoints['medicines'], {name, effect, contraindications})
    return res;
}

export const fetchCreateMedicineUnit = async (medicineUnitData) => {
    const res = await APIs.post(endpoints['medicine-units'], medicineUnitData)

    return res;
}