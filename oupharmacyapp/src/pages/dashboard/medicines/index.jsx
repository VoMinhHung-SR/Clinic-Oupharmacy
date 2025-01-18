import { useTranslation } from "react-i18next";
import useMedicine from "../../../lib/hooks/useMedicine"
import { Box, Button, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import Loading from "../../../modules/common/components/Loading";
import MedicineUnitLineItem from "../../../modules/pages/MedicineComponent/MedicineUnitLineItem";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const MedicineList = () => {
    const {page, pagination, handleChangePage,
        medicineLoading, medicines} = useMedicine()
    const { t, ready } = useTranslation(["medicine", "common", "modal"]);
    if (!ready)
        return (
          <Box sx={{ height: "300px" }}>
            <Helmet>
              <title>Medicine List</title>
            </Helmet>
    
            <Box className="ou-text-center ou-p-10">
                <Loading/>
            </Box>
          </Box>
        )
    return (
        <>
          <Helmet>
              <title>Medicine List</title>
          </Helmet>
              <Box className="ou-flex ou-justify-center ou-flex-col" >
              <TableContainer component={Paper} elevation={4}>
    
                <div className="ou-flex ou-items-center ou-justify-between">
                  <div className="ou-flex ou-items-end ou-py-8 ou-px-4">
                    <h1 className="ou-text-xl">{t('medicine:listOfMedicines')}</h1>
                    <span className="ou-pl-2 ou-text-sm">{t('medicine:resultOfTotal', {result: pagination.count})}</span>
                  </div>
    
                  <div className="ou-ml-auto ou-px-4 ou-py-8">
                      <Button color="success" variant="contained"
                      onClick={() => {handleOpenModal()}}>
                          <AddCircleOutlineIcon className="ou-mr-1"/> {t('medicine:addMedicine')}
                      </Button>
                  </div>
                
                </div>
                
                {/* Content area */}
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="center">{t("medicine:medicineName")}</TableCell>
                      <TableCell align="center">{t("medicine:inStock")}</TableCell>
                      <TableCell align="center">{t("medicine:price")}</TableCell>    
                      <TableCell align="center">{t("medicine:packing")}</TableCell>
                      <TableCell align="center">{t("medicine:category")}</TableCell>
                      <TableCell align="center">
                        <Box className="ou-flex ou-justify-center ou-items-center">
                          {t("function")} 
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {medicineLoading && 
                      <TableCell colSpan={12} component="th" scope="row">
                          <Box className="ou-text-center ou-p-10">
                              <Loading/>
                          </Box>
                        </TableCell>
                    }

                    {
                      !medicineLoading && medicines.length > 0 && medicines.map(medicine => (
                        <MedicineUnitLineItem  data={medicine}/>
                      ))
                    }
  
                    {!medicineLoading && medicines.length === 0 &&  <TableCell colSpan={12} component="th" scope="row">
                        <Typography> 
                            <Box className="ou-text-center ou-p-10 ou-text-red-700">
                                {t('examinations:errExamsNull')}
                            </Box>
                        </Typography>
                      </TableCell>
                    } 
    
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.sizeNumber >= 2 && (
                <Box sx={{ pt: 5, pb: 2 }}>
                  <Stack>
                    <Pagination
                      count={pagination.sizeNumber}
                      variant="outlined"
                      sx={{ margin: "0 auto" }}
                      page={page}
                      onChange={handleChangePage}
                    />
                  </Stack>
                </Box>
              )}
          </Box>
    
        </>
      );
}

export default MedicineList