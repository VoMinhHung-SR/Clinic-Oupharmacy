import React, { useContext } from 'react';
import { Box, Paper } from '@mui/material';
import Loading from '../../../modules/common/components/Loading';
import { useTranslation } from 'react-i18next';
import DoctorScheduleForm from '../../../modules/pages/DoctorScheduleComponents/DoctorScheduleForm';
import UserContext from '../../../lib/context/UserContext';
import DoctorScheduleWeeklyChart from '../../../modules/common/components/charts/DoctorScheduleWeeklyChart';

const DoctorSchedules = () => {
    const {t, tReady} = useTranslation(['doctor-schedule', 'common']);
    const {user} = useContext(UserContext);

    if(tReady)
        return <Box sx={{ minHeight: "300px" }}>
            <Box className='ou-p-5'>
                <Loading/>
            </Box>
        </Box>

    return (
        <>
            <Box component={Paper} className='ou-w-[60%] ou-mb-4 ou-mx-auto'>
                <DoctorScheduleWeeklyChart />
            </Box>
            <Box component={Paper} className='ou-w-[80%] ou-mx-auto'>     
                <DoctorScheduleForm doctor={user}/>
            </Box>
        </>
    );
}   

export default DoctorSchedules;