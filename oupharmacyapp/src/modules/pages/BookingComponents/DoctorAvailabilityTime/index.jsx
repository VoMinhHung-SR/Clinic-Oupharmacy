import React, { useState } from 'react';

const DoctorAvailabilityTime = ({ disabledTimes, isLoading, selectedStartTime, selectedEndTime, onChange, defaultValue }) => {
  const [selectedTime, setSelectedTime] = useState({ start: selectedStartTime, end: selectedEndTime });

  const renderRadioButtons = () => {
    const morningHours = Array.from({ length: 4 }, (_, index) => 8 + index); // 8-12
    const afternoonHours = Array.from({ length: 4 }, (_, index) => 13 + index); // 13-17

    const hours = [...morningHours, ...afternoonHours];

    return hours.map((hour, index) => {
      const startHour = `${hour.toString().padStart(2, "0")}:00:00`;
      const endHour = `${(hour + 1).toString().padStart(2, "0")}:00:00`;
      const label = `${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`;
      const isDisabled = disabledTimes.some(
        (time) => time.is_off === false && time.time_slots.some(
          (slot) => slot.start_time === startHour && slot.end_time === endHour
        )
      );
      const isSelected = startHour === selectedTime.start && endHour === selectedTime.end;
      const shouldDisable = isDisabled && (!isSelected || !selectedStartTime || !selectedEndTime);
      
      const isDefaultSelected = label === defaultValue;
      return (
        <label
          key={index}
          className={`ou-radio-label ${shouldDisable ? 'ou-opacity-50 ou-cursor-not-allowed' : ''} ${isSelected ? 'ou-selected' : ''}`}
        >
          <input
            type="radio"
            name="hour"
            value={label}
            className="ou-radio-input"
            disabled={shouldDisable}
            onChange={handleChange}
            checked={isSelected || isDefaultSelected}
          />
          <div className={`ou-radio-custom ${isSelected ? 'ou-selected-time' : ''}`}>{label}</div>
        </label>
      );
    });
  };
  const handleChange = (event) => {
    const value = event.target.value;
    const [start, end] = value.split(' - ').map((time) => time.trim());
  
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    };
  
    setSelectedTime({ start: formatTime(start), end: formatTime(end) });
    onChange(event);
  };

  return (
    <div className="ou-radio-container">
      {!isLoading && renderRadioButtons()}
    </div>
  );
};

export default DoctorAvailabilityTime;
