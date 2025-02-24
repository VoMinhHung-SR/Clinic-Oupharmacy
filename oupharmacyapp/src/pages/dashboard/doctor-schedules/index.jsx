import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, Container, Box } from '@mui/material';
import moment from 'moment';

const DoctorSchedules = () => {
    const methods = useForm({
        mode: "onSubmit",
        defaultValues: {
            doctorID: null,
            weekly_schedule: {}
        }
    });

    const { control, handleSubmit } = methods;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sessions = ['morning', 'afternoon'];

    const today = moment();
    const startOfWeek = today.clone().startOf('isoWeek'); 

    const onSubmit = data => {
        console.log(data);
    };
    
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
                                    <TableCell>{session}</TableCell>
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
                    <div className='ou-text-right'>
                        <Button type="submit" variant='contained' color='success' 
                        className='!ou-mx-3 !ou-my-2'>Submit</Button>
                    </div>
                </TableContainer>
            </form>
        </Box>
    );
}   

export default DoctorSchedules;