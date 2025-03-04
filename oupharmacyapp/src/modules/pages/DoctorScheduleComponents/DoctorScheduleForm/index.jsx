import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, Box } from '@mui/material';
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import moment from 'moment';
import { ROLE_DOCTOR } from '../../../../lib/constants';
import useDoctorSchedule from '../hooks/useDoctorSchedule';

const DoctorScheduleForm = ({ doctor }) => {

    const {onSubmit} = useDoctorSchedule();

    const methods = useForm({
        mode: "onSubmit",
        defaultValues: {
            doctorID: doctor.id,
            weekly_schedule: {}
        }
    });
    const { control, handleSubmit } = methods;
    const {t} = useTranslation(['doctor-schedule', 'common']);
    
    const days = [t('doctor-schedule:monday'), t('doctor-schedule:tuesday'), 
        t('doctor-schedule:wednesday'), t('doctor-schedule:thursday'),
        t('doctor-schedule:friday'), t('doctor-schedule:saturday')];
    
    const sessions = ['morning', 'afternoon'];
    const today = moment();
    const startOfWeek = today.clone().startOf('isoWeek');   

    return (
        <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {days.map((day, index) => (
                                <TableCell key={day} className='!ou-text-center'>
                                    <span className='ou-font-bold'>{day}</span>
                                    <br />
                                    <span>
                                        ({startOfWeek.clone().add(index, 'days').format('DD/MM/YYYY')})
                                    </span>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sessions.map((session) => (
                            <TableRow key={session}>
                                <TableCell>{session === 'morning' ? t('doctor-schedule:morning') : t('doctor-schedule:afternoon')}</TableCell>
                                {days.map((day, index) => {
                                    const date = startOfWeek.clone().add(index, 'days').format('YYYY-MM-DD');
                                    return (
                                        <TableCell key={day} className='!ou-text-center'>
                                            <Controller
                                                name={`weekly_schedule.${date}.${session}`}
                                                control={control}
                                                defaultValue={{ session: session.toLowerCase(), is_off: true }}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        {...field}
                                                        checked={!field.value.is_off}
                                                        onChange={(e) => field.onChange({ ...field.value, is_off: !e.target.checked })}
                                                    />
                                                )}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {
                    doctor.role === ROLE_DOCTOR ? <>
                        <div className='ou-text-right'>
                            <Button type="submit" variant='contained' color='success' 
                            className='!ou-mx-3 !ou-my-2'>{t('common:submit')}</Button>
                        </div>
                    </> : <>
                        <div></div>
                    </>
                }
                
            </TableContainer>
        </form>
    </Box>
    );
}   
export default DoctorScheduleForm;