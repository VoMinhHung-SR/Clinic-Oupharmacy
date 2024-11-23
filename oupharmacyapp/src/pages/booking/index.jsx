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

const Booking = () => {
    const {user} = useContext(UserContext)
    const { t, ready } = useTranslation(['booking','common'])

    const { allConfig } = useSelector((state) => state.config);

    const {state, actionUpState, actionDownState} = useContext(BookingContext)

    const {checkEmail, checkPatientExist, openBackdrop, 
        checkPatientExistSchema, patientList, isLoading,
        formEmail, isFormEmailOpen, handleOpenFormEmail} = useBooking()

    const [isAddNewPatient, setIsAddNewPatient] =  useState(true)
    const [IsPatientCreated, setPatientCreated] = useState(false)
    const [patientID, setPatientID] = useState(-1)

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
    

    const checkUpStateTwoToThree = () => {
        // option 1: create a new patient
        if(isAddNewPatient)
            if (state === 2 && !IsPatientCreated)
                return createToastMessage({type: TOAST_ERROR ,message:t('booking:errPatientNeedToCreate')})
            if (state === 2 && IsPatientCreated)
                return actionUpState()
        // option 2: not create patient => select an exist patient
        if (state === 2 && !patientID === -1 )
            return createToastMessage({type: TOAST_ERROR ,message:t('booking:errPatientNeedToSelect')})
        
        return actionUpState()
    }

    const createPatientSuccess = () => {
        setPatientCreated(true)
        actionUpState()
    }

    // const renderIsOpenEmailForm = (isFormEmailOpen) => {
    //     if(isFormEmailOpen)
    //     return (
    //         <Container>
    //             <Box className="ou-w-[60%] ou-max-w-[600px] 
    //             ou-absolute ou-top-[40%] ou-left-[50%] -ou-translate-y-1/2 -ou-translate-x-1/2 ou-m-auto" component={Paper} elevation={6}>        
    //                 <div>
    //                     <form className="mb-5 p-4 " onSubmit={methods.handleSubmit(checkEmail)} style={{"margin": "auto",
    //                     "padding": "20px 20px", "borderRadius": "5px" }}>
    //                         <FormControl fullWidth >
    //                             <InputLabel htmlFor="email">{t('enterEmail')}</InputLabel>
    //                             <OutlinedInput
    //                                 autoComplete="given-name"
    //                                 id="email"
    //                                 name="email"
    //                                 label={t('enterEmail')}
    //                                 endAdornment={
    //                                     <IconButton position="start" type='submit' >
    //                                         <SendIcon />
    //                                     </IconButton>
    //                                 }
    //                                 error={methods.formState.errors.email}
    //                                 {...methods.register("email")}
    //                                 />
    //                             {methods.formState.errors ? (<span className="ou-text-xs ou-text-red-600 ou-mt-1">{methods.formState.errors.email?.message}</span>) : <></>}
    //                         </FormControl>
    //                     </form>                   
                    
    //                 </div>
    //             </Box>
    //         </Container>
    //     )
    // }


    // === Base step ===
    
    const renderStep = () => {

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
                <span className="ou-absolute ou-translate-x-[-50%] ou-top-[15%] ou-text-xl
                ou-text-blue-700 ou-font-bold">{t('booking:patientProfileList')}</span>
                <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    {patientList && patientList.map(p => <PatientCard patientData={p} 
                    callBackOnClickCard={setPatientID} key={"pa"+p.id} isSelected={patientID === p.id}/>)}
                </Grid>
            </div>
        )
    
    }
    // Step 3
    const renderThirdState = () => {
        return (<div>xin chao day la state 3</div>)
    }
    

    return (
        <>
            <Helmet>
                <title>Booking</title>
            </Helmet>

            <Box className="ou-py-8 ou-h-[100vh]">
                <Box className=" ou-min-h-[400px] ou-h-[90%] ou-relative
                            ou-m-auto ou-flex ou-items-center ou-justify-center" 
                            component={Paper} elevation={6}>        

                    <div className="ou-text-center ou-py-5">           
                        {state === 1 && renderSelectionBookingMethod()}
                        {state === 2 && renderSecondState()}
                        {state === 3 && renderThirdState()}
                    </div>

                    <div className="ou-bottom-0 ou-absolute ou-right-0 ou-m-3">
                        {renderStep()}
                    </div>
                </Box>
            </Box>
            
          
            {/* {allConfig && allConfig.doctors ? allConfig.doctors.map((d)=> 
                <DoctorProfileCard doctorInfo={d} key={d.id}/>) : <></>} */}
            
            {openBackdrop === true ?
                (<BackdropLoading />)
                : <></>
            } 
            
            {/* {renderIsOpenEmailForm(isFormEmailOpen)}
            {!isFormEmailOpen && 
            <> 
                {(!methods.formState.errors.email && methods.getValues('email') !== '' && !isFormEmailOpen) ?
                        <FormAddExamination 
                        checkPatientExist={checkPatientExist} 
                        patientID={patientID}
                        email={formEmail.email}
                        handleOpenFormEmail={handleOpenFormEmail}
                    />
                     : <></>
                }   
            </>} */}
        </>
    )
    
}
export default Booking