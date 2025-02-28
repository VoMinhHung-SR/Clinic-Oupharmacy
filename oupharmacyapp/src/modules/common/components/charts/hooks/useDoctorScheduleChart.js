import moment from "moment";
import { useEffect, useState } from "react";
import { fetchGetDoctorScheduleByWeek } from "../../../../pages/DoctorScheduleComponents/services";
import { useSearchParams } from "react-router-dom";

const useDoctorScheduleChart = () => {
    const [dataChart, setDataChart] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const now = moment();
    const [selectedWeek, setSelectedWeek] = useState(now.isoWeek());
    
    const [q] = useSearchParams();
    useEffect(()=> {
        const getScheduleWeekly = async () => {
            try{
                let query = q.toString();
                
                let querySample = query 
                querySample === "" ? 
                (querySample += `week=${selectedYear}-W${selectedWeek.toString().padStart(2, '0')}`): 
                (querySample += `&week=${selectedYear}-W${selectedWeek.toString().padStart(2, '0')}`);
            
                const res = await fetchGetDoctorScheduleByWeek(querySample)
                if (res.status === 200) {
                    setDataChart(res.data)
                }
            }
            catch (err) {
                console.log(err)
                setDataChart([])
            }
        }
        getScheduleWeekly();
    }, [selectedYear, selectedWeek])

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    }

    const handleChangeWeek = (e) => {   
        setSelectedWeek(e.target.value)
    }

    return {
        dataChart, selectedWeek, selectedYear,
        handleChangeWeek, handleYearChange
    }   
}

export default useDoctorScheduleChart;