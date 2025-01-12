import { useEffect, useState } from "react"
import { fetchCategoryList } from "../services"

const useCategory = () => {
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        try{
            const getCategories = async () =>{
                const res = await fetchCategoryList()
                if (res.status === 200)
                    setCategories(res.data)
            }
            getCategories()
        }catch(err){
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }, [])
    
    return {
        categories, isLoading
    }
}

export default useCategory