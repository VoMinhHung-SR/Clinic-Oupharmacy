import { Box, Button, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import moment from "moment"
import useCustomModal from "../../../../lib/hooks/useCustomModal";
import { useTranslation } from "react-i18next";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ERROR_CLOUDINARY } from "../../../../lib/constants";
import { formatNumberCurrency } from "../../../../lib/utils/helper";
const MedicineUnitLineItem = ({data}) => {
    const { handleCloseModal, isOpen, handleOpenModal } = useCustomModal();

    const { t } = useTranslation(["examinations", "common", "modal"]);
    
    const medicine = data
    return (
        <TableRow key={medicine.id}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          <img src={medicine.image_path} height={40} width={40}
          alt={`${medicine.image}-${medicine.id}`} />
        </TableCell>
        <TableCell align="left">
     
          <Typography className="ou-table-truncate-text-container ou-flex">
            <span>
              {medicine.medicine.name}
            </span>
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{medicine.in_stock}</Typography>
        </TableCell >
        <TableCell align="center"> 
            <Typography>{formatNumberCurrency(medicine.price)}</Typography>
          </TableCell>
          <TableCell align="center"> 
            <Typography>{medicine.packaging}</Typography>
          </TableCell>
          <TableCell align="center">
          <Typography>{medicine.category.name}</Typography>
        </TableCell>
      
        <TableCell align="center">
          <Box   className="ou-flex ou-justify-center ou-items-center">
            <Typography>
                {/* {user && renderButton()} */}
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
                      <EditIcon/>
                    </Button>
                </span>
              </Tooltip>

              <Tooltip followCursor title={t("common:delete")} >
                <span>
                  <Button
                      variant="contained"
                      color="error"
                      className=" !ou-min-w-[68px]  !ou-min-h-[40px] !ou-py-2 !ou-mx-2"
                      size="small"
                      onClick={()=>handleOpenModal()}
                    >
                      <DeleteIcon/>
                    </Button>
                </span>
              </Tooltip>
            </Typography>
          </Box>
       
        </TableCell>
      </TableRow>
    )
}

export default MedicineUnitLineItem