import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);


const DoctorScheduleWeeklyChart = () => {
  const {t} = useTranslation(['doctor-schedule']);
  
  const data = {
    labels:  [t('doctor-schedule:monday'), t('doctor-schedule:tuesday'), 
      t('doctor-schedule:wednesday'), t('doctor-schedule:thursday'),
      t('doctor-schedule:friday'), t('doctor-schedule:saturday')],
    datasets: [
      {
        label: 'Bác sĩ A',
        data: [10, 12, 8, 15, 20, 5],
        borderColor: '#FF5733',
        backgroundColor: 'rgba(255, 87, 51, 0.2)',
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: 'Bác sĩ B',
        data: [8, 10, 7, 12, 18, 6],
        borderColor: '#33A2FF',
        backgroundColor: 'rgba(51, 162, 255, 0.2)',
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: 'Bác sĩ C',
        data: [5, 7, 6, 10, 14, 3],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: 'Tổng số phiếu đặt lịch',
        data: [23, 29, 21, 37, 52, 14],
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 2, 
        tension: 0.4,
        pointRadius: 6, 
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw} ${t('doctor-schedule:appointments')}`;
          },
        },
      },
    },
    scales: {
      y: { title: { display: true, text: t('doctor-schedule:appointments')} },
    },
  };

    return <Line data={data} options={options} />;
}

export default DoctorScheduleWeeklyChart;