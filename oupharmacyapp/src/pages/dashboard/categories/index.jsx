import { Box, Button, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Loading from "../../../modules/common/components/Loading";
import useCategory from "../../../modules/pages/CategoriesComponents/hooks/useCategory";

const CategoryList = () => {
    // const { isLoading, examinationList, handleDeleteExamination, 
    //     handleChangePage, page,pagination} = useExaminationList();
    const {categories, isLoading} = useCategory();
    const router = useNavigate();
 
    const {t,ready} = useTranslation(['examinations','common'])   
    
    if(!ready)
        return <Box sx={{ minHeight: "300px" }}>
        <Helmet>
            <title>Category list</title>
        </Helmet>
        <Box className='ou-p-5'>
            <Loading></Loading>
        </Box>
    </Box>

    return(
    <>
        <Helmet>
            <title>Category list</title>
        </Helmet>
        {isLoading && categories.length === 0 ?
            (<Box sx={{ minHeight: "300px" }}>
                <Box className='ou-p-5'>
                    <Loading></Loading>
                </Box>
            </Box>)
            : categories.length === 0 ?
                (<Box className="ou-relative ou-items-center  ou-h-full">
                    <Box className='ou-absolute ou-p-5 ou-text-center 
                    ou-flex-col ou-flex ou-justify-center ou-items-center
                    ou-top-0 ou-bottom-0 ou-w-full ou-place-items-center'>
                        <h2 className='ou-text-xl ou-text-red-600'>
                            {t('errExaminationList')}
                        </h2>
                        <Typography className='text-center'>
                            <h3>{t('common:goToBooking')}</h3>
                            <Button onClick={() => { router('/booking') }}>{t('common:here')}!</Button>
                        </Typography>
                    </Box>
                </Box>)
                : (
                    <Box sx={{ minHeight: "300px" }}>
                        <TableContainer component={Paper}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('id')}</TableCell>
                                        <TableCell align="left">{t('common:name')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.map(c => (
                                        <TableRow
                                        key={c.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                            <TableCell component="th" scope="row" >
                                                <Typography>
                                                    {c.id}
                                                </Typography>
                                            </TableCell>
                                
                                            <TableCell align="center">
                                                <Typography className="ou-table-truncate-text-container">
                                                    {c.name}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                 
                )
            }
        
            </>)
} 


export default CategoryList