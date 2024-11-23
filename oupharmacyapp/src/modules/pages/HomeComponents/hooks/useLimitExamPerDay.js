import { useEffect, useState } from "react"
import { fetchGetTotalExamsPerDay } from "../services"

const useLimitExamPerDay = (date) => {
    const [totalExams, setTotalExams]= useState(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)
    const handleOpenModal = () => setIsOpen(true)

    useEffect(()=> {
        const loadTotalExamsPerDay = async (date) => {
            const res = await fetchGetTotalExamsPerDay(date)
            if(res.status === 200)
                setTotalExams(res.data.totalExams)
        }
        if(date)
            loadTotalExamsPerDay(date)
    }, [date])
    
    return {
        totalExams, isOpen, handleCloseModal,handleOpenModal
    }
}

export default useLimitExamPerDay