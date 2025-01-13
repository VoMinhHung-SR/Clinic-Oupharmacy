import { useEffect, useState } from "react"
import { fetchCategoryList, fetchCreateCategory } from "../services"
import createToastMessage from "../../../../lib/utils/createToastMessage"
import { TOAST_SUCCESS } from "../../../../lib/constants"
import { useTranslation } from "react-i18next"

const useCategory = () => {
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [flag, setFlag] = useState(false)
    const {t} = useTranslation(['modal'])

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
    }, [flag])
    
    const onSubmit = (data) => {
        const handleOnSubmit = async () => {
            try{
                const res = await fetchCreateCategory(data.name)
                if(res.status === 201)
                    return createToastMessage({type:TOAST_SUCCESS,
                        message: t('modal:createSuccess')});
                
            }catch (err) {
                console.log(err)
            }finally {
                setFlag(!flag)
            }
        }
        handleOnSubmit()
    }

    return {
        categories, isLoading, onSubmit
    }
}

export default useCategory