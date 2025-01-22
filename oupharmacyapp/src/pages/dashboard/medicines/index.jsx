import { useTranslation } from "react-i18next";
import useMedicine from "../../../lib/hooks/useMedicine"
import { Box, Button, FormControl, InputLabel, MenuItem, Pagination, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import Loading from "../../../modules/common/components/Loading";
import MedicineUnitLineItem from "../../../modules/pages/MedicineComponent/MedicineUnitLineItem";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CustomModal from "../../../modules/common/components/Modal";
import useCustomModal from "../../../lib/hooks/useCustomModal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useCategory from "../../../modules/pages/CategoriesComponents/hooks/useCategory";
import { useEffect } from "react";
import SchemaModels from "../../../lib/schema";

const MedicineList = () => {
    const {page, pagination, handleChangePage, selectedImage, setSelectedImage,
      imageUrl, setImageUrl, medicineLoading, medicines} = useMedicine()

    const {categories, isLoading} = useCategory()
    const { handleCloseModal, isOpen, handleOpenModal } = useCustomModal();

    const { t, ready } = useTranslation(["medicine", "common", "modal"]);

    const {medicineUnitSchema} = SchemaModels()
    
    const methods = useForm({
      mode: "onSubmit",
      resolver: yupResolver(medicineUnitSchema),
      defaultValues: {
          name: ""
      }
  })

  useEffect(() => {
        if (selectedImage) {
            setImageUrl(URL.createObjectURL(selectedImage));
        }

    }, [selectedImage]);

    if (!ready && medicineLoading && isLoading)
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
                                {t('medicine:errMedicinesNull')}
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
        
          <CustomModal
            title={t('medicine:addMedicine')}
            className="ou-w-[800px]"
            open={isOpen}
            onClose={handleCloseModal}
            content={
            <Box className="ou-p-8">
                <form onSubmit={methods.handleSubmit((data) => onSubmitCreateOrUpdate(data) )}>
                    <div className="ou-mb-3">
                        <TextField
                            className="ou-w-full !ou-mb-2"
                            variant="outlined"
                            label={t('medicine:medicineName')}
                            error={methods.formState.errors.name}
                            {...methods.register("name")} 
                        />

                        <TextField
                            className="ou-w-full !ou-mb-2"
                            variant="outlined"
                            label={t('medicine:effect')}
                            error={methods.formState.errors.effect}
                            {...methods.register("effect")} 
                        />

                        <TextField
                            className="ou-w-full !ou-mb-2"
                            variant="outlined"
                            label={t('medicine:contraindications')}
                            error={methods.formState.errors.contraindications}
                            {...methods.register("contraindications")} 
                        />
                      <div className="ou-flex ou-mb-2">

                        <TextField
                            className="ou-w-full !ou-mr-2"
                            variant="outlined"
                            label={t('medicine:price')}
                            error={methods.formState.errors.price}
                            {...methods.register("price")} 
                        />
                        <TextField
                            className="ou-w-full"
                            variant="outlined"
                            label={t('medicine:inStock')}
                            error={methods.formState.errors.name}
                            {...methods.register("inStock")} 
                        />
                        <TextField
                            className="ou-w-full !ou-ml-2"
                            variant="outlined"
                            label={t('medicine:packaging')}
                            error={methods.formState.errors.name}
                            {...methods.register("packaging")} 
                        />
                      </div>
                      <div>
                        <FormControl className='!ou-min-w-[200px] !ou-mr-3'>
                            <InputLabel id="prescription_filter_email">{t('medicine:category')}</InputLabel>
                                <Select
                                    id="form__addMedicine_category"      
                                    name="category"
                                    label={t('medicine:category')}
                                    {...methods.register("category")} 
                                >
                                  {categories && categories.map(c =><MenuItem value={c.id}>{c.name}</MenuItem> )}
                                </Select>
                        </FormControl>

                        <Box className="ou-py-2">
                            <input accept="image/*" type="file" id="select-image" style={{ display: 'none' }}
                                onChange={(e) => {
                                    setSelectedImage(e.target.files[0]);
                                }}
                            />
          
                            <label htmlFor="select-image">
                                <Button className="!ou-min-w-[150px]"  variant="contained" color="primary" component="span">
                                    {t('medicine:uploadMedicineImage')}
                                </Button>
                            </label>
            
                            {imageUrl && selectedImage && (
                                <Box className="ou-my-4 ou-border-solid" textAlign="center">
                                    <img src={imageUrl} alt={selectedImage.name} height="250px" width={250} className="ou-mx-auto"/>
                                </Box>
                            )}
                        </Box>
                      </div>
                        {methods.formState.errors ? (<p className="ou-text-xs ou-text-red-600 ou-mt-1 ou-mx-[14px]">
                            {methods.formState.errors.name?.message}</p>) : <></>} 

                    </div>
                    <div className="ou-text-right">
                        <Button type="submit" color="success" variant="contained">{t('common:submit')}</Button>
                    </div>
                </form>
            </Box>
        }
        />

        </>
      );
}

export default MedicineList