import { useEffect, useState } from "react"
import { fetchMedicinesUnit } from "../../modules/common/components/card/PrescriptionDetailCard/services"
import { useSearchParams } from "react-router-dom";
import { fetchCreateMedicine, fetchCreateMedicineUnit } from "../../modules/pages/ProductComponents/services";
import SuccessfulAlert from "../../config/sweetAlert2";
import createToastMessage from "../utils/createToastMessage";
import { TOAST_SUCCESS } from "../constants";
import { useTranslation } from "react-i18next";

const useMedicine = () => {

    const [medicines, setMedicines] = useState([])
    const [medicineLoading, setMedicineLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [flag, setFlag] = useState(false)
    const [backdropLoading, setBackDropLoading] = useState(false)
    const {t} = useTranslation(['modal'])
    // ====== QuerySet ======
    const [q] = useSearchParams();

    // ====== Pagination ======
    const [pagination, setPagination] = useState({ count: 0, sizeNumber: 0 });
    const [page, setPage] = useState(1);

    const handleChangePage = (event, value) => {
        if(page === value)
            return
        setMedicineLoading(true);
        setMedicines([]);
        setPage(value);
    };

    useEffect(() => {
        const loadMedicines = async () => {
            try{
                let query = q.toString();
                
                let querySample = query
                
                querySample === "" ? (querySample += `page=${page}`) : (querySample += `&page${page}`)

                const res = await fetchMedicinesUnit(querySample)
                if (res.status === 200) {
                    const data = await res.data;
                    setMedicines(data.results)

                    setPagination({
                        count: data.count,
                        sizeNumber: Math.ceil(data.count / 9),
                    });
                }
            }catch(err) {
                setMedicines([])
            } finally {
                setMedicineLoading(false)
            }
        }
        loadMedicines()
    }, [page, flag])

    const addMedicine = (data, callBackSuccess) => {
        const handleMedicine = async () => {
            try{
                setBackDropLoading(true)
                
                const resMedicine = await fetchCreateMedicine({
                    name: data.name, effect: data.effect, contraindications: data.contraindications})
                
                const medicineUnitSubmit = {
                    price: data.price,
                    inStock: data.inStock,
                    image: imageUrl
                }     
                if(resMedicine.status === 201){
                    const resMedicineUnit = await fetchCreateMedicineUnit(
                        medicineUnitSubmit, resMedicine.data.id, data.category)
                    if(resMedicineUnit.status === 201){
                        callBackSuccess()
                        createToastMessage({type:TOAST_SUCCESS, message: t('modal:createSuccess')});
                    }
                }
                    
           }catch(err){
                console.log(err)
            }finally{
                setBackDropLoading(false)
                setFlag(!flag)
            }
        }
        handleMedicine()
    }

    return {
        page,
        imageUrl,
        medicines,
        pagination,
        selectedImage,
        medicineLoading, backdropLoading,
        setSelectedImage, setImageUrl,
        handleChangePage, addMedicine
    }
}

export default useMedicine