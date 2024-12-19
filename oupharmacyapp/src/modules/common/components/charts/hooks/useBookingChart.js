import { useEffect, useState } from "react";
import { fetchBookingStats } from "../../../../../lib/services";

const useBookingChart = () => {

    const [bookingChartData, setBookingChartData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const res = await fetchBookingStats(0, 2024)
            if(res.status === 200)
                setBookingChartData(res.data.data_examination)
        } catch (error) {
            console.error('Error fetching booking stats:', error.response?.data || error.message);
        }finally{
            setLoading(false)
        }
        };
        fetchStats();
    }, []);
    return{
        loading, bookingChartData
    }
}

export default useBookingChart