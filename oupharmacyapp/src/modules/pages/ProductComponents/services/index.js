import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCreateMedicine = async ({name, effect, contraindications}) => {
    const res = await APIs.post(endpoints['medicines'], {name, effect, contraindications})
    return res;
}

export const fetchCreateMedicineUnit = async (medicineUnitData) => {
    const res = await APIs.post(endpoints['medicine-units'], medicineUnitData)

    return res;
}

export const fetchDeletedMedicine = async (medicineID) => {
    const res = await APIs.delete(endpoints['medicine-detail'](medicineID))
    return res;
}

export const fetchDeletedMedicineUnit = async (medicineUnitID) => {
    const res = await APIs.delete(endpoints['medicine-units-detail'](medicineUnitID))
    return res;
}