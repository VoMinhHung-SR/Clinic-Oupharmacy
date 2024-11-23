import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField } from "@mui/material"
import moment from "moment"
import { CURRENT_DATE } from "../../../../lib/constants"
import DoctorAvailabilityTime from "../DoctorAvailabilityTime"
import Loading from "../../../common/components/Loading"
import { useTranslation } from "react-i18next"
import useDoctorAvailability from "../DoctorAvailabilityTime/hooks/useDoctorAvailability"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect } from "react"

const BookingForm = ({doctorInfo}) => {
    const {t , tReady} = useTranslation(['booking', 'yup-validate', 'modal'])

    const doctor = doctorInfo;
    const {timeNotAvailable, isLoading, setDate, slideRight, handleSlideChange, setDoctorID,
        formAddExaminationSchema, onSubmit} = useDoctorAvailability();

    useEffect(()=>{setDoctorID(doctor.id)},[doctor.id])

    const handleDateChange = (event) => {
        setDate(event.target.value);
        methods.setValue("selectedDate", event.target.value); // Updated field name 
        methods.trigger("selectedDate"); // Trigger validation for the field
        // Reset time to empty string when the date changes
        if (methods.getValues('selectedTime')) {
            methods.setValue('selectedTime', ''); // Reset the time to an empty string
            methods.trigger('selectedTime'); // Trigger validation for the selectedTime field
        }
    };

    const methods = useForm({
        mode:"obSubmit", 
        resolver: yupResolver(formAddExaminationSchema),
        defaultValues:{
            description:"",
            selectedDate:"",
            selectedTime: "",
            doctor: doctor.id ? doctor.id : "",
            firstName:"",
            lastName:"",
            email:  "",
            phoneNumber:"",
            address:"",
            dateOfBirth:"",
            gender:0
        }
    })
    
    if (tReady)
        return <Box sx={{ minHeight: "300px" }}>
        <Box className='ou-p-5'>
            <Loading></Loading>
        </Box>
    </Box>;

    const disableButton = () => {
 
        return <Button variant="contained" 
            color="primary" 
            type="button" 
            onClick={handleSlideChange}
            disabled={(!methods.getValues('selectedDate') || !methods.getValues('selectedTime')) && true }
            style={{"padding": "6px 40px", "marginLeft":"auto"}}
            >
            {t('booking:continue')}
        </Button>

            
    }
    
    
    const renderPatientInformationForm = (slideRight) => {
        if(!slideRight)
            return  (<>
                    <h3 className="ou-text-2xl ou-text-center ou-mb-5">{t('booking:doctorInfo')}</h3>
                    <div className="ou-flex ou-mb-3">
                        <p className="ou-w-[50%]">{t('firstName')}: {doctor.first_name}</p>
                        <p className="ou-w-[50%]">{t('lastName')}: {doctor.last_name}</p>
                    </div>
                    <div className="ou-mb-3">{t('description')}:  </div>
                    <Grid item className="!ou-mt-6 !ou-mb-3">
                        <TextField
                            fullWidth
                            id="selectedDate"
                            name="selectedDate"
                            type="date"
                            label={t('createdDate')}
                            value={methods.getValues("selectedDate") ? methods.getValues("selectedDate") : ""}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                min: moment(CURRENT_DATE).add(1, 'days').format('YYYY-MM-DD'),
                            }}
                            onChange={handleDateChange}
                            />

                            {methods.formState.errors.selectedDate && (
                            <p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">
                                {methods.formState.errors.selectedDate.message}
                            </p>
                            )}
                            {(doctor && timeNotAvailable && methods.getValues('selectedDate')) && (
                                <Grid item xs={12} className={clsx("!ou-mt-6 ou-pl-2")}>
                                <DoctorAvailabilityTime 
                                    disabledTimes={timeNotAvailable} 
                                    onChange={(event)=> {methods.setValue('selectedTime', event.target.value), 
                                    methods.trigger("selectedTime");}}
                                    isLoading={isLoading}
                                    defaultValue={methods.getValues('selectedTime')}
                                    />
                            </Grid>)}
                    </Grid>
            </>)
        return (<>
            <h5 className="ou-text-center ou-text-2xl">{t('patientInfo')}</h5>
            <Grid item xs={12} className="!ou-mt-6" >
                <FormControl fullWidth >
                    <InputLabel htmlFor="description">{t('description')}</InputLabel>
                    <OutlinedInput
                        fullWidth
                        autoComplete="given-name"
                        autoFocus
                        multiline
                        rows={2}
                        id="description"
                        name="description"
                        type="text"
                        label={t('description')}
                        error={methods.formState.errors.description}
                        {...methods.register("description")}
                    />
                    {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.description?.message}</p>) : <></>}
                </FormControl>
            </Grid>
            
            <Grid container justifyContent="flex"  id={1}>
                <Grid item xs={6}  className="!ou-mt-6 ou-pr-2" >
                    <TextField
                        fullWidth
                        autoComplete="given-name"
                        id="firstName"
                        name="firstName"
                        type="text"
                        label={t('firstName')}
                        error={methods.formState.errors.firstName}
                        {...methods.register("firstName")}
                    />
                    {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.firstName?.message}</p>) : <></>}                            </Grid>

                <Grid item xs={6} className="!ou-mt-6 ou-pl-2" >
                    <TextField
                        fullWidth
                        autoComplete="given-name"
                        id="lastName"
                        name="lastName"
                        type="text"
                        label={t('lastName')}
                        error={methods.formState.errors.lastName}
                        {...methods.register("lastName")}
                    />
                    {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.lastName?.message}</p>) : <></>}
                </Grid>
            </Grid>

            <Grid container justifyContent="flex" >
                <Grid item xs={7} className="!ou-mt-6 ou-pr-2">
                    <TextField
                        fullWidth
                        autoComplete="given-name"
                        id="email"
                        name="email"
                        type="text"
                        label={t('email')}
                        error={methods.formState.errors.email}
                        {...methods.register("email")}
                      
                    />
                    {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.email?.message}</p>) : <></>}
                </Grid>

                <Grid item xs={5} className="!ou-mt-6 ou-pl-2">

                    <TextField
                        fullWidth
                        autoComplete="given-name"
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        label={t('phoneNumber')}
                        error={methods.formState.errors.phoneNumber}
                        {...methods.register("phoneNumber")}
                        />
                        {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.phoneNumber?.message}</p>) : <></>}
                </Grid>
            </Grid>

            <Grid container justifyContent="flex" style={{ "margin": "0 auto" }} >
                <Grid item xs={12} className="!ou-mt-6">
                    <TextField
                        fullWidth
                        autoComplete="given-name"
                        id="address"
                        name="address"
                        type="text"
                        label={t('address')}
                        error={methods.formState.errors.address}
                        {...methods.register("address")}                             
                        />
                        {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.address?.message}</p>) : <></>}
                        
                </Grid>

            </Grid>

            <Grid container justifyContent="flex" style={{ "margin": "0 auto", "marginBottom": "12px" }}>
                <Grid item xs={12} className="!ou-mt-6">
                    <FormControl>
                        <TextField
                            id="dateOfBirth"
                            label={t('dateOfBirth')}
                            type="date"
                            name="dateOfBirth"
                            error={methods.formState.errors.dateOfBirth}
                            sx={{ width: 220 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            style={{ "margin": "5px" }}
                            inputProps={{
                                max: moment(CURRENT_DATE).add(0, 'days').format('YYYY-MM-DD') ,
                            }}
                            {...methods.register("dateOfBirth")} 
                        />
                        {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.dateOfBirth?.message}</p>) : <></>}
                    </FormControl>
                    <FormControl sx={{ width: 220 }} style={{ "margin": "5px" }}>
                        <InputLabel id="demo-simple-select-label">{t('gender')}</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="gender"
                            error={methods.formState.errors.gender}
                            label={t('gender')}
                            defaultValue={0}
                            {...methods.register("gender")} 
                        >
                            <MenuItem value={0}>{t('man')}</MenuItem>
                            <MenuItem value={1}>{t('woman')}</MenuItem>
                            <MenuItem value={2}>{t('secret')}</MenuItem>
                        </Select>
                        {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.gender?.message}</p>) : <></>}
                    </FormControl>
                </Grid>
            </Grid>
        </>)
    }

    return (
        <>
        <Box   >
            <div className="!ou-px-10 !ou-py-4">
                
                    <form onSubmit={methods.handleSubmit((data)=> 
                    onSubmit(data, () => methods.reset(), methods.setError()))}
                        className="ou-m-auto  ou-px-5"> 
                        
                        {/* Patient Form required */}
                        {renderPatientInformationForm(slideRight)}
                        {/* Area button */}
                        <Grid item xs={12} className="ou-flex !ou-mb-3">
                            {!slideRight ?  disableButton(): <>
                                <Button variant="contained" 
                                    color="primary" 
                                    type="button" 
                                    onClick={handleSlideChange}
                                    style={{"padding": "6px 40px", "marginRight": "8px", "marginLeft":"auto"}}
                                    >
                                     {t('booking:goBack')}
                                </Button> 
                                <Button variant="contained" 
                                color="success" 
                                type="submit" 
                                style={{"padding": "6px 40px"}}
                                >
                                {t('submit')}
                                </Button>
                            </>}
                        </Grid>
                        
                    </form>
               
      
            </div>
        </Box>
        </>
    )
}
export default BookingForm