import React, { createContext, useEffect, useState, useReducer } from 'react';
import Cookies from 'js-cookie';
import userReducer from '../reducer/userReducer';
import { getCookieValue } from '../utils/getCookieValue';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [state, setState] = useState(1)

  const [patientSelected, setPatientSelected] = useState({})

  useEffect(()=> {}, [state]) 

  const actionUpState = () => {
    setState(state + 1)
  }
  const actionDownState = () => {
    setState(state - 1)
  }

  return (
    <BookingContext.Provider value={{ 
    state, patientSelected, setPatientSelected,
    actionUpState, actionDownState }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;