import React, { createContext, useReducer } from 'react';

const SELECT_SUBJECT = 'SELECT_SUBJECT';
const ADD_ATTENDANCE = 'ADD_ATTENDANCE';

const initialState = {
  activeSemester: null,
  semesters: [],
  subjects: [],
  attendanceRecords: [],
  attendanceGoal: 75,
  theme: 'dark',
  isLoading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case SELECT_SUBJECT:
      return {
        ...state,
        selectedSubject: action.payload,
      };
    case ADD_ATTENDANCE:
      return {
        ...state,
        attendanceRecords: [...state.attendanceRecords, action.payload],
      };
    default:
      return state;
  }
}

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};