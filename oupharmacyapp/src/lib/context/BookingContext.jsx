import React, { createContext, useEffect, useState, useReducer } from 'react';
import Cookies from 'js-cookie';
import userReducer from '../reducer/userReducer';
import { getCookieValue } from '../utils/getCookieValue';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [state, setState] = useState(1)

  useEffect(()=> {}, [state]) 

  const actionUpState = () => {
    setState(state + 1)
  }
  const actionDownState = () => {
    setState(state - 1)
  }

  return (
    <BookingContext.Provider value={{ state, actionUpState, actionDownState }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;