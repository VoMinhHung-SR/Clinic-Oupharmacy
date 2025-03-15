import { Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, Tooltip } from "@mui/material"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import Loading from "../../../modules/common/components/Loading"
import FormAddPatient from "../../../modules/pages/BookingComponents/FormAddPatient"
import PatientCard from "../../../modules/common/components/card/PatientCard"
import moment from "moment"
import usePatient from "../../../lib/hooks/usePatient"
import EditIcon from '@mui/icons-material/Edit';
const PatientManagement = () => {
    
    const {patientList, isLoading} = usePatient()
    const {t, tReady} = useTranslation(['booking', 'common'])
    const router = useNavigate();
    
    if (tReady)
        return <Box sx={{ minHeight: "300px" }}>
             <Helmet>
                <title>Patient Management</title>
            </Helmet>
            <Box className='ou-p-5'>
                <Loading></Loading>
            </Box>
    </Box>;
    
    return (
        <>
        
            <Helmet>
                <title>{t('common:patientManagement')}</title>
            </Helmet>

            {isLoading && patientList.length === 0 ?
                (<Box sx={{ minHeight: "300px" }}>
                    <Box className='ou-p-5'>
                        <Loading></Loading>
                    </Box>
                </Box>)
            : patientList.length === 0 ?
                (<Box className="ou-relative ou-items-center  ou-h-full">
                    <Box className='ou-absolute ou-p-5 ou-text-center 
                    ou-flex-col ou-flex ou-justify-center ou-items-center
                    ou-top-0 ou-bottom-0 ou-w-full ou-place-items-center'>
                        <h2 className='ou-text-xl ou-text-red-600'>
                            {t('errExaminationList')}
                        </h2>
                        <Typography className='ou-text-center'>
                            <h3>{t('common:goToBooking')}</h3>
                            <Button onClick={() => { router('/booking') }}>{t('common:here')}!</Button>
                        </Typography>
                    </Box>
                </Box>)
                : (
                    <Box sx={{ minHeight: "300px" }}>
                        <TableContainer>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('id')}</TableCell>
                                        <TableCell align="center">{t('fullName')}</TableCell>
                                        <TableCell align="center">{t('phoneNumber')}</TableCell>
                                        <TableCell align="center">{t('email')}</TableCell>
                                        <TableCell align="center">{t('gender')}</TableCell>
                                        <TableCell align="center">{t('dateOfBirth')}</TableCell>
                                        <TableCell align="center">{t('address')}</TableCell>
                                        <TableCell align="center">{t('common:function')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {patientList.map(patient => (
                                        <TableRow>
                                            <TableCell>{patient.id}</TableCell>
                                            <TableCell align="center">{patient.first_name + ' ' + patient.last_name}</TableCell>
                                            <TableCell align="center">{patient.phone_number}</TableCell>
                                            <TableCell align="center">{patient.email}</TableCell>
                                            <TableCell align="center">{patient.gender === 0 ? t('booking:man') : patient.gender === 1 
                                            ? t('booking:woman') : t('common:secret') }</TableCell>
                                            <TableCell align="center">{moment(patient.date_of_birth).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {patient.address?.split(' ').slice(0, 2).join(' ')}
                                                {patient.address?.split(' ').length > 2 ? '...' : ''}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip followCursor title={t('common:edit')} className="hover:ou-cursor-pointer ">
                                                    <Button variant="contained"
                                                            className="!ou-mr-2 !ou-min-w-[68px]  !ou-p-2  hover:ou-cursor-pointer"
                                                            color="success"
                                                            // onClick={handleOpenModal}
                                                            >
                                                            <EditIcon/> 
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    {/* {pagination.sizeNumber >= 2 && (
                        <Box sx={{ pt: 5, pb: 2 }}>
                        <Stack>
                            <Pagination
                            count={pagination.sizeNumber}
                            variant="outlined"
                            sx={{ margin: "0 auto" }}
                            page={page}
                            onChange={handleChangePage}
                            />
                        </Stack>
                        </Box>
                    )} */}
                    </Box>
                 
                )
        }
        </>
    )
}
export default PatientManagement
