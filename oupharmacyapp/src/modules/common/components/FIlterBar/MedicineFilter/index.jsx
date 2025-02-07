import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Tooltip }  from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';

const MedicineFilter = (props) => {
    const {t} = useTranslation(['yup-validate', 'medicine'])
    const methods = useForm({
        mode:"onSubmit", 
        defaultValues:{
            kw: props.kw ? props.kw : '',
            cate: props.cateFilter ? props.cateFilter : 0,
        }
    })

    const categories = props.categories

    return (
        <>
            <Box className='ou-px-3 ou-mb-3'>
                <form onSubmit={methods.handleSubmit((data) => props.onSubmit(data))} 
                className='ou-flex ou-items-center ou-mt-5 ou-mb-3'>
                    <FormControl className='!ou-min-w-[100px] !ou-mr-3'>
                        <InputLabel id="medicineUnit_filter_cateLabel">{t('examinations:cateFilter')}</InputLabel>
                            <Select
                                id="medicineUnit_filter_cate_select"      
                                name="cate"
                                label={('medicine:category')}
                                defaultValue={props.cateFilter ? props.cateFilter : 0}
                                {...methods.register("cate")} 
                            >
                                <MenuItem value={0}>{t('examinations:all')}</MenuItem>
                                {categories && categories.map(c =>
                                    <MenuItem key={`medicineUnit_filter_cate_${c.id}_select`} 
                                    value={c.id}>{c.name}</MenuItem>
                                )}
                            </Select>
                    </FormControl>

                    <FormControl  className=' !ou-mr-3'>
                        <TextField
                            required={false}
                            variant="outlined"
                            label={t('medicine:filterUserLabel')}
                            {...methods.register("kw")} 
                        />

                    </FormControl>
                    
                    <Tooltip title={t('medicine:search')} followCursor>
                        <Button variant="outlined" 
                            color="success" 
                            type="submit" 
                            className='!ou-p-3.5'
                        >
                            <SearchIcon fontSize='medium'/>
                        </Button>
                    </Tooltip>
                </form>
            </Box>
            
        </>
    )

}

export default MedicineFilter