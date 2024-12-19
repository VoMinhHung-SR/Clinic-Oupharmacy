import { useEffect, useState } from "react";
import { fetchRevenueStats } from "../../../../../lib/services";

const useRevenueChart = () => {
    const [revenueData, setRevenueData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const res = await fetchRevenueStats(0, 2024)
            if(res.status === 200){
                setRevenueData(res.data.data_revenue)
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error.response?.data || error.message);
        }finally{
            setLoading(false)
        }
        };
        fetchStats();
    }, []);
    return{
        loading, revenueData
    }
}

export default useRevenueChart