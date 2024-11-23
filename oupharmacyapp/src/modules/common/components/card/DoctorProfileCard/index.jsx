import { Avatar, Box, Container, Grid, Paper, TextField } from "@mui/material";
import { AVATAR_DEFAULT, CURRENT_DATE, ERROR_CLOUDINARY } from "../../../../../lib/constants";
import { useTranslation } from "react-i18next";
import Loading from "../../Loading";
import BookingForm from "../../../../pages/BookingComponents/BookingForm";

const DoctorProfileCard = ({doctorInfo}) => {
    const {t , tReady} = useTranslation(['booking', 'yup-validate', 'modal'])

    const doctor = doctorInfo;

    if (tReady)
        return <Box sx={{ minHeight: "300px" }}>
        <Box className='ou-p-5'>
            <Loading></Loading>
        </Box>
    </Box>;
  
    return (
        <>  
            {!doctor && <></>}
            {doctor &&
                <Container className="!ou-py-6">
                    <Box className="ou-flex ou-py-4" component={Paper} elevation={4} >
                        <div className="ou-w-[30%]">
                        <Box className="ou-p-5">
                            <div className="ou-text-center">
                            <Avatar
                                variant="rounded" className="ou-m-auto"
                                src={doctor.avatar === ERROR_CLOUDINARY ? AVATAR_DEFAULT : doctor.avatar}
                                alt={doctor.first_name + doctor.last_name}   
                                sx={{ width: 240, height: 240, '& > img': { objectFit: 'contain' } }}
                            />  
                            </div>
                        </Box>
                        </div>
                        
                       
                        <div className="ou-w-[70%] ">
                            <BookingForm doctorInfo={doctor}/>
                        </div>
                    </Box>
                </Container>
            }
            
        </>
    )
}
export default DoctorProfileCard;