import React, { useContext } from 'react';
import { Box } from '@mui/material';
import Loading from '../../../modules/common/components/Loading';
import { useTranslation } from 'react-i18next';
import DoctorScheduleForm from '../../../modules/pages/DoctorScheduleComponents/DoctorScheduleForm';
import UserContext from '../../../lib/context/UserContext';

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
       <DoctorScheduleForm doctor={user}/>
    );
}   

export default DoctorSchedules;