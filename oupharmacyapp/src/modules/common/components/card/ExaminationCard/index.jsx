import {
  Box,
  Button,
  CircularProgress,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PaidIcon from "@mui/icons-material/Paid";
import SendIcon from "@mui/icons-material/Send";
import ErrorIcon from "@mui/icons-material/Error";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { ROLE_DOCTOR, ROLE_NURSE } from "../../../../../lib/constants";
import CustomModal from "../../Modal";
import useCustomModal from "../../../../../lib/hooks/useCustomModal";
import ExaminationDetailCard from "../ExaminationDetailCard";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
const ExaminationCard = ({examinationData, user, callback, disableOtherCards, loading, sendEmailConfirm}) => {
  const { t } = useTranslation(["examinations", "common", "modal", "examination-detail"]);

  const {id, description, created_date, mail_status, doctor_info, diagnosis_info} = examinationData
  const { handleCloseModal, isOpen, handleOpenModal } = useCustomModal();
 
  const handleSendEmailConfirm = async () => {
    sendEmailConfirm();
  };

 
  const renderButton = () => {
    return (
      <Tooltip followCursor title={t("sendEmail")}>
        <Button
          onClick={handleSendEmailConfirm}
          disabled={disableOtherCards}
          variant="contained"
          className="!ou-min-w-[68px] !ou-py-2"
        >
          {loading ? <CircularProgress size={24} /> : <SendIcon />}
        </Button>
      </Tooltip>
    );
  };
  return (
    <>
      <TableRow
        key={id}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          <Typography>{id}</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography className="ou-table-truncate-text-container">
            {description}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{doctor_info.day ? <span>{moment(new Date(doctor_info.day)).format("DD/MM/YYYY")}</span>
          : <span>{moment(created_date).format("DD/MM/YYYY")}</span>}</Typography>
        </TableCell>
        {mail_status ? (
          <TableCell align="center" className="!ou-text-green-700 !ou-font-bold"> {t("sent")}</TableCell>
        ) : (
          <TableCell align="center" className="!ou-text-red-700 !ou-font-bold"> {t("noSent")}</TableCell>
        )}
          <TableCell align="center">
          <Typography> {diagnosis_info?.length ? 
            <span><CheckCircleIcon className="!ou-text-green-700"/></span> 
          : <span><CheckCircleIcon className="!ou-text-red-700"/></span>}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{examinationData?.user?.email ? examinationData.user.email : "undefined"}</Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{examinationData?.doctor_info?.first_name + " " + examinationData?.doctor_info?.last_name}</Typography>
        </TableCell>
        <TableCell
          align="center"
        
        >
          <Box   className="ou-flex ou-justify-center ou-items-center">
            <Typography>
              {mail_status === true ? (
                <>
                  {/* {user && user.role === ROLE_DOCTOR && (
                    <>
                      <Link
                        style={{ textDecoration: "none" }}
                        to={`/dashboard/examinations/${id}/diagnosis`}
                      >
                      <Tooltip followCursor title={t("diagnose")} className="hover:ou-cursor-pointer">
                        <span>
                            <Button
                              variant="contained"
                          
                              color="success"
                              className="!ou-min-w-[68px] !ou-min-h-[40px] !ou-p-2  hover:ou-cursor-pointer"
                            >
                                <MedicalServicesIcon />
                            </Button>
                        </span>
                          
                        </Tooltip>
                      </Link>
                    </>
                  )} */}
                  {user && user.role === ROLE_NURSE ? (
                    <>
                      <Tooltip followCursor title={t("pay")}>
                        <span>
                          <Link
                            style={{ textDecoration: "none" }}
                            to={`/dashboard/payments/examinations/${id}`}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              className="!ou-min-w-[68px] !ou-py-2  !ou-min-h-[40px]"
                            >
                              <PaidIcon />
                            </Button>
                          </Link>
                        
                        </span>
                      </Tooltip>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <>
                  {/* Render button for DOCTORS */}
                  {user && user.role === ROLE_DOCTOR  &&
                    <>
                      <Tooltip followCursor title={t("noReady")}>
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            className="!ou-bg-red-700 !ou-min-w-[68px]  !ou-min-h-[40px]"
                          >
                            
                                <ErrorIcon />
                            </Button>
                            </span>
                          
                      </Tooltip>
                    </>
                 }
                  {/* Render button for NURSES */}
                  {user && user.role === ROLE_NURSE && renderButton()}
                </>
              )}
            </Typography>
            <Typography>
              <Tooltip followCursor title={t("detail")} >
                <span>
                  <Button
                      variant="contained"
                      className="ou-bg-blue-700 !ou-min-w-[68px]  !ou-min-h-[40px] !ou-py-2 !ou-mx-2"
                      size="small"
                      onClick={()=>handleOpenModal()}
                    >
                      <AssignmentIcon />
                    </Button>
                </span>
              </Tooltip>
            </Typography>
          </Box>
       
        </TableCell>
      </TableRow>
      

      <CustomModal
        className="ou-w-[900px]"
        open={isOpen}
        onClose={handleCloseModal}
        content={<Box>
          <div>
            <ExaminationDetailCard examinationData={examinationData} />
          </div> 
        </Box>}
        actions={[
          <Button key="cancel" onClick={handleCloseModal}>
            {t('modal:cancel')}
          </Button>
        ]}
        />
    
    </>

  );
};
export default ExaminationCard;