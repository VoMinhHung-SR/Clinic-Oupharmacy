import { Box, Button, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import moment from "moment"
import useCustomModal from "../../../../lib/hooks/useCustomModal";
import { useTranslation } from "react-i18next";

const MedicineUnitLineItem = ({data}) => {
    const { handleCloseModal, isOpen, handleOpenModal } = useCustomModal();

    const { t } = useTranslation(["examinations", "common", "modal"]);
    
    const medicine = data
    return (
        <TableRow key={medicine.id}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          <Typography>{medicine.id}</Typography>
        </TableCell>
        <TableCell align="left">
          <Typography className="ou-table-truncate-text-container">
            {medicine.medicine.name}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography>{medicine.in_stock}</Typography>
        </TableCell >
        <TableCell align="center"> 
            <Typography>{medicine.price}</Typography>
          </TableCell>
          <TableCell align="center"> 
            <Typography>{medicine.packaging}</Typography>
          </TableCell>
          <TableCell align="center">
          <Typography>{medicine.category}</Typography>
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