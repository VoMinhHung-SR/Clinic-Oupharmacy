import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import moment from 'moment';
import { ROLE_DOCTOR } from '../../../../lib/constants';
import useDoctorSchedule from '../hooks/useDoctorSchedule';
import { useEffect } from 'react';
import Loading from '../../../common/components/Loading';

const DoctorScheduleForm = ({ doctor }) => {
    const { onSubmit, setSelectedWeek, existSchedule, selectedWeek, selectedYear, isLoading } = useDoctorSchedule();

    const methods = useForm({
        mode: "onSubmit",
        defaultValues: {
            doctorID: doctor.id,
            weekly_schedule: {}
        }
    });
    const { control, handleSubmit, reset } = methods;
    const { t } = useTranslation(['doctor-schedule', 'common']);
    
    const days = [t('doctor-schedule:monday'), t('doctor-schedule:tuesday'),
        t('doctor-schedule:wednesday'), t('doctor-schedule:thursday'),
        t('doctor-schedule:friday'), t('doctor-schedule:saturday')];
    
    const sessions = ['morning', 'afternoon'];
    
    // Get days of selected week
    const startOfSelectedWeek = moment().year(selectedYear).week(selectedWeek).startOf('isoWeek');
    const daysOfSelectedWeek = Array.from({ length: 6 }, (_, i) => startOfSelectedWeek.clone().add(i, 'days').format('DD/MM/YYYY'));

    // Update form when existSchedule changes
    useEffect(() => {
        if (existSchedule && Object.keys(existSchedule).length > 0) {
            const doctorSchedule = existSchedule[doctor.email];
            if (doctorSchedule) {
                reset({
                    doctorID: doctor.id,
                    weekly_schedule: doctorSchedule
                });
            }
        }
    }, [existSchedule, doctor, reset]);

    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
    };

    return (
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <FormControl variant="outlined" className='!ou-mr-3'>
                                        <InputLabel>{t('doctor-schedule:week')}</InputLabel>
                                        <Select 
                                            value={selectedWeek} 
                                            onChange={handleWeekChange}
                                            label={t('doctor-schedule:week')} 
                                            className='ou-max-h-[200px] ou-overflow-y-auto'
                                        >
                                            {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                                                <MenuItem key={`w-${week}`} value={week}>
                                                    {t('doctor-schedule:week')} {week}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                {/* Render dates */}
                                {daysOfSelectedWeek.map((day, index) => (
                                    <TableCell key={day} className='!ou-text-center'>
                                        <span className='ou-font-bold'>{days[index]}</span>
                                        <br />
                                        <span>({day})</span>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session}>
                                    <TableCell>{session === 'morning' ? t('doctor-schedule:morning') : t('doctor-schedule:afternoon')}</TableCell>
                                    {/* Render Checkbox each of date */}
                                    {daysOfSelectedWeek.map((day, index) => {
                                        const date = startOfSelectedWeek.clone().add(index, 'days').format('YYYY-MM-DD');
                                        const isDisabled = moment(date).isSameOrBefore(moment(), 'day');
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
                                                            disabled={isDisabled}
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
                    {isLoading && <div className="ou-text-center ou-p-4"><Loading/>   </div>}
                    {
                        doctor.role === ROLE_DOCTOR ? (
                            <div className='ou-text-right'>
                                <Button 
                                    type="submit" 
                                    variant='contained' 
                                    color='success' 
                                    className='!ou-mx-3 !ou-my-2'
                                    disabled={isLoading}
                                >
                                    {t('common:submit')}
                                </Button>
                            </div>
                        ) : <div></div>
                    }
                </TableContainer>
            </form>
        </Box>
    );
}   

export default DoctorScheduleForm;