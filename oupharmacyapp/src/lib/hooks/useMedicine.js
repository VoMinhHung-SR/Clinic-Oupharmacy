import { useEffect, useState } from "react"
import { fetchMedicinesUnit } from "../../modules/common/components/card/PrescriptionDetailCard/services"
import { useSearchParams } from "react-router-dom";

const useMedicine = () => {

    const [medicines, setMedicines] = useState([])
    const [medicineLoading, setMedicineLoading] = useState(true)

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
    }, [page])

    return {
        page,
        medicines,
        pagination,
        medicineLoading,
        handleChangePage
    }
}

export default useMedicine