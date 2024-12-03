import { Box, Button, Container, FormControl, Grid, IconButton, InputLabel, OutlinedInput, Paper } from "@mui/material"

import SendIcon from '@mui/icons-material/Send';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormAddExamination from "../../modules/pages/BookingComponents/FormAddExamination";
import BackdropLoading from "../../modules/common/components/BackdropLoading";
import { useTranslation } from "react-i18next";
import Loading from "../../modules/common/components/Loading";
import useBooking from "../../modules/pages/BookingComponents/hooks/useBooking";
import { Helmet } from "react-helmet";
import DoctorProfileCard from "../../modules/common/components/card/DoctorProfileCard";
import { useSelector } from "react-redux";
import { useContext, useState } from "react";
import UserContext from "../../lib/context/UserContext";
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import clsx from "clsx";
import FormAddPatient from "../../modules/pages/BookingComponents/FormAddPatient";
import BookingContext from "../../lib/context/BookingContext";
import createToastMessage from "../../lib/utils/createToastMessage";
import { TOAST_ERROR } from "../../lib/constants";
import PatientCard from "../../modules/common/components/card/PatientCard";
import BookingProcess from "../../modules/pages/BookingComponents/BookingProcess";

const Booking = () => {
    const {user} = useContext(UserContext)
    const { t, ready } = useTranslation(['booking','common'])

    const { allConfig } = useSelector((state) => state.config);

    const {state, actionUpState, actionDownState, patientSelected, setPatientSelected} = useContext(BookingContext)

    const {checkEmail, checkPatientExist, openBackdrop, 
        checkPatientExistSchema, patientList, isLoading,
        formEmail, isFormEmailOpen, handleOpenFormEmail} = useBooking()

    const [isAddNewPatient, setIsAddNewPatient] =  useState(true)
    const [IsPatientCreated, setPatientCreated] = useState(false)

    const methods = useForm({
        mode:"onSubmit",
        resolver: yupResolver(checkPatientExistSchema),
        defaultValues:{
            email:""
        }
    })
    // TODO: adding skeletons here
    if (!ready)
        return <Box sx={{ minHeight: "300px" }}>
             <Helmet>
                <title>Booking</title>
            </Helmet>
            <Box className='ou-p-5'>
                <Loading></Loading>
            </Box>
    </Box>;
    
    const onCallbackPatientCardOnClick = (patientData) => {
        setPatientSelected(patientData)
    }

    const checkUpStateTwoToThree = () => {
        // option 1: create a new patient
        if(isAddNewPatient)
            if (state === 2 && !IsPatientCreated)
                return createToastMessage({type: TOAST_ERROR ,message:t('booking:errPatientNeedToCreate')})
            if (state === 2 && IsPatientCreated)
                return actionUpState()
        // option 2: not create patient => select an exist patient
        if (state === 2 && !patientSelected )
            return createToastMessage({type: TOAST_ERROR ,message:t('booking:errPatientNeedToSelect')})
        
        return actionUpState()
    }

    const createPatientSuccess = (patientData) => {
        setPatientSelected(patientData)
        setPatientCreated(true)
        actionUpState()
    }
    // === Base step ===
    const renderStep = () => {
        if (state ===  4)
            return;
        if (state === 1)
            return <button
                    className={clsx("ou-btn-base ou-min-w-[120px]" ,{})
                    } onClick={()=> actionUpState()}>{t('booking:next')}</button>
        if (state === 3)
            return <button className="ou-btn-base ou-min-w-[120px]" onClick={()=> actionDownState()}>{t('booking:previous')}</button>
        return (
            <>
                <button className="ou-mr-3 ou-btn-base ou-min-w-[120px]" onClick={()=> actionDownState()}>{t('booking:previous')}</button>
                <button className=" ou-btn-base ou-min-w-[120px]" onClick={()=> checkUpStateTwoToThree()}>{t('booking:next')}</button>
            </>
        )
    }


    // Step 1
    const renderSelectionBookingMethod = () => {
        if (isLoading)
            return <BackdropLoading/>
        if(user)
            if(patientList.length !== 0)
                return (
                    <>
                        <div className="ou-flex ou-justify-center ou-space-x-10 ">
                            <button onClick={()=>{setIsAddNewPatient(true)}} 
                                className={
                                    clsx("ou-btn-booking ou-border-opacity-60",{
                                        "ou-btn-booking__focus": isAddNewPatient === true,
                                    })
                                }>  
                                <div className="ou-flex ou-flex-col ou-justify-center ou-items-center">
                                    <AddIcon className="!ou-text-[120px] ou-mb-3 "/>
                                    <span className="ou-pt-5 ou-font-bold">Adding new Patient</span>
                                </div>
                            </button>
                            
                            <div>
                                <button onClick={()=>{setIsAddNewPatient(false)}} className={
                                    clsx("ou-btn-booking ou-border-opacity-60",{
                                        "ou-btn-booking__focus": isAddNewPatient === false,
                                    })
                                }
                                >  
                                    <div className="ou-flex ou-flex-col ou-justify-center ou-items-center">
                                        <PersonIcon  className="!ou-text-[120px] ou-mb-3 "/>
                                        <span className="ou-pt-5 ou-font-bold">Using exist Patient</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )
            else
                return (
                    <div className="ou-flex ou-justify-center">
                        <button onClick={()=>{setIsAddNewPatient(true)}}  className={
                                        clsx("ou-btn-booking ou-border-opacity-60",{
                                            "ou-btn-booking__focus": isAddNewPatient === true,
                                        })
                                    }>  
                            <div className="ou-flex ou-flex-col ou-justify-center ou-items-center">
                                <AddIcon className="!ou-text-[120px] ou-mb-3 "/>
                                <span className="ou-pt-5 ou-font-bold">Adding new Patient</span>
                            </div>
                        </button>
                    </div>
            )
        else
            return <Box>Ban nen thuc hien dang nhap</Box>
    }

    // Step 2 : State 2: when user choosing create with new patient
    // or choosing create with exist patient  
    const renderSecondState = () => {
        if (isAddNewPatient)
            return  <FormAddPatient onCallbackSuccess={createPatientSuccess}/>
        
        return (
            <div> 
                <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }} justifyContent={"center"}>
                    {patientList && patientList.map(p => <PatientCard patientData={p} 
                    callBackOnClickCard={onCallbackPatientCardOnClick} key={"pa"+p.id} isSelected={patientSelected.id === p.id}/>)}
                </Grid>
            </div>
        )
    
    }
    // Step 3
    const renderThirdState = () => {
        if (state===3)
        return (<Box>
            {allConfig && allConfig.doctors ? allConfig.doctors.map((d)=> 
                <DoctorProfileCard doctorInfo={d} key={d.id}/>) : <></>}
        </Box>)
    }
    // Step 4 
    const renderLastState = () => {
        return(
            <Box>Cam on ban da dat lich kham cua chung toi</Box>
        )
    }

    return (
        <>
            <Helmet>
                <title>Booking</title>
            </Helmet>

            <Box className="ou-relative ou-py-8 ou-min-h-[80vh] ou-flex">
                <Box className="ou-relative ou-w-full
                            ou-m-auto ou-flex ou-items-center ou-justify-center" 
                            component={Paper} elevation={6}>        

                    {/* Progression area */}
                    <div className="ou-absolute ou-top-[5%]">
                        <BookingProcess/>
                    </div>

                    <div className="ou-text-center ou-py-20 ou-w-[80%] ou-mt-8">           
                        {state === 1 && renderSelectionBookingMethod()}
                        {state === 2 && renderSecondState()}
                        {state === 3 && renderThirdState()}
                        {state === 4 && renderLastState()}
                    </div>

                    <div className="ou-bottom-0 ou-absolute ou-right-0 ou-m-3">
                        {renderStep()}
                    </div>
                </Box>

               
            </Box>
            
            
            {openBackdrop === true ?
                (<BackdropLoading />)
                : <></>
            } 
        </>
    )
    
}
export default Booking