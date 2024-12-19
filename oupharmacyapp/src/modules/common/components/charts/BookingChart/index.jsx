import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BookingChart = ({ dataBooking, year }) => {
    const {t} = useTranslation(['dashboard'])
    // Chart data
    const data = {
        labels: [
            t('dashboard:January'), t('dashboard:February'),
            t('dashboard:.March'), t('dashboard:April'),
            t('dashboard:May'), t('dashboard:June'),
            t('dashboard:July'), t('dashboard:August'),
            t('dashboard:September'), t('dashboard:October'),
            t('dashboard:November'), t('dashboard:December'),
        ],
        datasets: [
            {
                label: `${t('dashboard:examinationLabel')} ${year}`,
                data: dataBooking,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: `${t('examinationTitle')} ${year}`
            }
        }
    };
    return <Bar data={data} options={options} />;
};

export default BookingChart;