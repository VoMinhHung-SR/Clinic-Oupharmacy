import APIs, { endpoints } from "../../../../config/APIs"

export const fetchCreateMedicine = async ({name, effect, contraindications}) => {
    const res = await APIs.post(endpoints['medicines'], {name, effect, contraindications})
    return res;
}

export const fetchCreateMedicineUnit = async (data, medicineID, cateID) => {
    const res = await APIs.post(endpoints['medicine-units'],{
        price: data.price,
        in_stock: data.inStock,
        image: data.image,
        packaging: data.packaging,
        medicine: medicineID,
        category: cateID
    })

    return res;
}