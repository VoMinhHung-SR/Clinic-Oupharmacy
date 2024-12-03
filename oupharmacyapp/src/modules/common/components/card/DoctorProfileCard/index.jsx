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
                <Container className="!ou-py-4">
                    <Box className="ou-flex ou-py-4" component={Paper} elevation={4} >           
                        <div className="ou-w-[100%]">
                            <BookingForm doctorInfo={doctor}/>
                        </div>
                    </Box>
                </Container>
            }
            
        </>
    )
}
export default DoctorProfileCard;