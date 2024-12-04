import { Avatar, Box, Button, CardHeader, Collapse, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField } from "@mui/material"
import moment from "moment"
import { CURRENT_DATE } from "../../../../lib/constants"
import DoctorAvailabilityTime from "../DoctorAvailabilityTime"
import Loading from "../../../common/components/Loading"
import { useTranslation } from "react-i18next"
import useDoctorAvailability from "../DoctorAvailabilityTime/hooks/useDoctorAvailability"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useContext, useEffect } from "react"
import CustomCollapseListItemButton from "../../../common/components/collapse/ListItemButton"
import BookingContext from "../../../../lib/context/BookingContext"
import StethoscopeIcon from "../../../../lib/icon/StethoscopeIcon"

const BookingForm = ({doctorInfo}) => {
    const {t , tReady} = useTranslation(['booking', 'yup-validate', 'modal', 'home'])

    const doctor = doctorInfo;
    const {patientSelected, actionUpState} = useContext(BookingContext)
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
                    <CustomCollapseListItemButton isOpen={true} title={
                        <div className="ou-flex ou-justify-center ou-items-center">
                            <div className="ou-mr-2">
                                <Avatar>
                                    <StethoscopeIcon size={20}/>
                                </Avatar>
                            </div>
                        <p className="ou-w-full ou-text-blue-700 ou-font-bold">{doctor.first_name} {doctor.last_name}</p>
                        </div>} 
                        loading={isLoading}
                        content={
                            <>
                            <Divider />
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
                                        <Grid item xs={12} className={clsx("!ou-mt-6")}>
                                        <DoctorAvailabilityTime 
                                            disabledTimes={timeNotAvailable} 
                                            onChange={(event)=> {methods.setValue('selectedTime', event.target.value), 
                                            methods.trigger("selectedTime");}}
                                            isLoading={isLoading}
                                            defaultValue={methods.getValues('selectedTime')}
                                            />
                                    </Grid>)}
                            </Grid>

                            </>
                            
                        }
                    />                    
            </>)
        return (<>
            <div className="ou-flex ou-justify-center ou-items-center ou-py-2 ou-px-4">
                <div className="ou-mr-2">
                    <Avatar></Avatar>
                </div>
                <p className="ou-w-full ou-text-blue-700 ou-font-bold ou-text-left">{doctor.first_name} {doctor.last_name}</p>
                <Divider />
            </div>
            <h5 className="ou-text-center ou-text-xl ou-py-2 ou-mt-2">{t('home:makeAnAppointMent')}</h5>
            <Grid item xs={12} className="!ou-p-4" >
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
        </>)
    }

    return (
        <>
        <Box> 
            <form onSubmit={methods.handleSubmit((data)=> onSubmit(data, patientSelected,() => {
                methods.reset(); actionUpState();},
                methods.setError()))} className="ou-m-auto ou-px-5"> 
                {/* Patient Form required */}
                {renderPatientInformationForm(slideRight)}
                {/* Area button */}
    
                <Grid item className="ou-flex !ou-mb-3">
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
        </Box>
        </>
    )
}
export default BookingForm