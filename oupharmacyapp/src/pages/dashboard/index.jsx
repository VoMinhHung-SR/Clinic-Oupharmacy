import { Box, Grid, Paper } from "@mui/material"
import { Helmet } from "react-helmet"
import StatisticCard from "../../modules/common/components/card/StatisticCard"
import { styled } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { CURRENT_DATE, MAX_EXAM_PER_DAY } from "../../lib/constants";
import useStatistic from "../../modules/pages/DashboardComponents/hooks/useStatistic";
import useLimitExamPerDay from "../../modules/pages/HomeComponents/hooks/useLimitExamPerDay";
import { useTranslation } from "react-i18next";
import Loading from "../../modules/common/components/Loading";
import PillsIcon from "../../lib/icon/PillsIcon";

const DashBoard = () => {

    const {t, tReady} = useTranslation(['dashboard'])

    const {totalPatients, totalUsers, totalMedicineUnit} = useStatistic()
    const {totalExams} = useLimitExamPerDay(CURRENT_DATE) 

    if (tReady)
        return <Box sx={{ minHeight: "300px" }}>
        <Box className='ou-p-5'>
            <Loading></Loading>
        </Box>
    </Box>;

    return (
        <>
        <Helmet>
            <title>Dashboard</title>
        </Helmet>

        <Box className="!ou-py-8 ou-mx-8 ou-flex ou-justify-center">
            {/* <StatisticCard icon={"patients"} title={"patientList"} value={10} footer={"day la footer"}/> */}
            <Grid container columns={{ xs: 4, sm: 6, md: 12 }} className="ou-flex">
                <Grid item xs={3} className="ou-p-2">
                    <StatisticCard icon={<AccessibilityNewIcon className="!ou-text-[60px] ou-text-blue-700"/>} 
                    title={t('dashboard:patients')} value={totalPatients} footer={t('dashboard:noteTotalPatients')}/>
                </Grid>

                <Grid item xs={3} className="ou-p-2">
                    <StatisticCard icon={<AccountCircleIcon className="!ou-text-[60px] ou-text-blue-700"/>} 
                    title={t('dashboard:users')} value={totalUsers} footer={t('dashboard:noteTotalUsers')}/>
                </Grid>
                <Grid item xs={3} className="ou-p-2">
                    <StatisticCard icon={<AssignmentIcon className="!ou-text-[60px] ou-text-blue-700"/>} 
                    title={t('dashboard:bookings')} value={`${totalExams}/${MAX_EXAM_PER_DAY}`} footer={t('dashboard:noteTotalBookings')}/>
                </Grid>
                
                <Grid item xs={3} className="ou-p-2">    
                    <StatisticCard icon={<PillsIcon size={60} className="ou-text-blue-700"/>} 
                    title={t('dashboard:medicineUnit')} value={totalMedicineUnit} footer={t('dashboard:noteTotalMedicines')}/>
                </Grid>
            </Grid>
                        
        </Box>
        </>
    )
}

export default DashBoard