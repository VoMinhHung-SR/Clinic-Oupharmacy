import { Autocomplete, Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField, Typography, createFilterOptions } from "@mui/material"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next";
import useFormAddExamination from "../../BookingComponents/FormAddExamination/hooks/useFormAddExamination";
import { useSelector } from "react-redux";
import Loading from "../../../common/components/Loading";
import DoctorAvailabilityTime from "../../BookingComponents/DoctorAvailabilityTime";
import { CURRENT_DATE } from "../../../../lib/constants";
import moment from "moment";
import clsx from "clsx";
import { useEffect, useMemo } from "react";
import { formatSelectedTime } from "../../../../lib/utils/helper";

const ExaminationUpdate = ({examination,handleClose, ...props}) => {
    const {t , tReady} = useTranslation(['booking', 'yup-validate', 'modal', 'common'])
    const {onUpdateSubmit, openBackdrop, date, shouldDisableTime, examinations, setDoctor, timeNotAvailable,
        doctor,setDate, formAddExaminationSchema, isLoading} = useFormAddExamination();

    const handleDateChange = (event) => {
        setDate(event.target.value);
        methods.setValue("selectedDate", event.target.value); // Updated field name
        methods.trigger("selectedDate"); // Trigger validation for the field
    };
   useEffect(()=> { 
        if (examination.doctor_info) {
            setDate(moment(examination.created_date).format("YYYY-MM-DD"))
            setDoctor(examination.doctor_info.id)
        }
        
    },[])
    const methods = useForm({
        mode:"obSubmit", 
        // resolver: yupResolver(formAddExaminationSchema),
        defaultValues:{
            description: examination?.description || "",
            selectedDate:  moment(examination?.created_date).format("YYYY-MM-DD") || "",
            selectedTime: formatSelectedTime(examination?.doctor_info?.start_time, examination?.doctor_info?.end_time) || "",
            doctor: examination?.doctor_info?.doctor_id || "",
            firstName: examination?.patient?.first_name || "",
            lastName: examination?.patient?.last_name || "",
            email: examination.patient?.email || "",
            phoneNumber: examination?.patient?.phone_number || "",
            address: examination?.patient?.address || "",
            dateOfBirth: moment(examination?.patient?.date_of_birth).format("YYYY-MM-DD") || "",
            gender: examination?.patient?.gender || 0
        }
    })
    const shouldRenderTimePicker = !!date; 
    const { allConfig } = useSelector((state) => state.config);

    const filterOptions = createFilterOptions({
        matchFrom: 'start',
        stringify: (option) => option.name,
    });

    if (tReady)
        return <Box sx={{ minHeight: "300px" }}>
        <Box className='ou-p-5'>
            <Loading></Loading>
        </Box>
    </Box>;


    return (
        <>
             <Box component={Paper} elevation={6}>
                <form onSubmit={methods.handleSubmit((data)=> 
                onUpdateSubmit(examination.id, examination?.patient?.id, data, ()=>{
                    methods.setError(),handleClose()}, examination?.doctor_info?.id))} 
                    className="ou-m-auto ou-py-6 ou-px-10">
                        <h3 className="ou-text-center ou-text-2xl">{t('updateBooking')}</h3>
                        <Grid container justifyContent="flex">
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
                 
                            
                                    <Grid item xs={shouldRenderTimePicker ? 6 : 12} className="!ou-mt-6 ou-pr-2">
                                        <TextField
                                        fullWidth
                                        id="selectedDate"
                                        name="selectedDate"
                                        type="date"
                                        label={t('createdDate')}
                                        {...methods.register("selectedDate")}
                                        error={methods.formState.errors.selectedDate}
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
                                    </Grid>
                                    {/* {shouldRenderTimePicker && ( */}
                                        <>
                                          <Grid item xs={6} className={clsx("!ou-mt-6 ou-pl-2")}>
                                           
                                                <Autocomplete
                                                    id="doctor"
                                                    options={allConfig.doctors}
                                                    getOptionLabel={(option) => `${t('Dr')} ${option.first_name + " " +option.last_name}`}
                                                    filterOptions={filterOptions}
                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    defaultValue={allConfig.doctors.find((doctor) => doctor.id === examination?.doctor_info?.doctor_id)}
                                                    noOptionsText={t('noDoctorFound')}
                                                    onChange={(event, value) => {
                                                        setDoctor(value.id)
                                                        methods.setValue('doctor', value.id)
                                                    }}
                                                    renderInput={(params) => <TextField {...params} label={t('doctor')} 
                        
                                                        error={methods.formState.errors.doctor?.message}
                                                        name="doctors"
                                                    />}
                                                />
                                                {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">
                                                    {methods.formState.errors.doctor?.message}</p>) : <></>}
                                         
                                        </Grid>

                                        {(doctor && timeNotAvailable) && (<Grid item xs={12} className={clsx("!ou-mt-6 ou-pl-2")}>
                                            <DoctorAvailabilityTime disabledTimes={timeNotAvailable} 
                                            selectedStartTime={examination?.doctor_info?.start_time}
                                            selectedEndTime={examination?.doctor_info?.end_time}
                                            onChange={(event)=> methods.setValue('selectedTime', event.target.value)}
                                            isLoading={isLoading}/>
                                        </Grid>)
                                        }
                                       
                                        </>
                                      
                                    {/* )} */}
                                  
                                
                                
                        </Grid>

                        <h5 className="ou-text-center ou-mt-8 ou-text-2xl">{t('patientInfo')}</h5>
                        <Grid container justifyContent="flex"  id={props.id}>
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
                                    value={props.email}
                                    error={methods.formState.errors.email}
                                    {...methods.register("email")}
                                    InputProps={{
                                        readOnly: true,
                                        startAdornment: <InputAdornment position="start"></InputAdornment>,
                                    }}
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
                                    value={props.address}
                                    error={methods.formState.errors.address}
                                    {...methods.register("address")}                             
                                    />
                                    {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">{methods.formState.errors.address?.message}</p>) : <></>}
                                    
                            </Grid>

                        </Grid>

                        <Grid container justifyContent="flex" style={{ "margin": "0 auto" }}>
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
                        <Grid container>
                            <Grid item sx={{ width: "100%"}}>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    className="ou-text-right"
                                    style={{ textDecoration: "inherit", margin:"40px auto 0px auto" }}
                                    color="grey.700"
                                >
                              
                                    <Button variant="contained" 
                                        color="success" 
                                        type="submit" 
                                        style={{"padding": "6px 40px"}}
                                        >
                                        {t('common:update')}
                                    </Button>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item sx={{ margin: "auto" }}>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    style={{ textDecoration: "inherit" }}
                                    color="grey.700"
                                >
                                    
                                </Typography>
                            </Grid>
                        </Grid>
                    </form>
             
                </Box>
        </>
    )
}

export default ExaminationUpdate