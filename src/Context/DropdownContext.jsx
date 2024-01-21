import React, { createContext, useContext, useEffect, useState } from 'react';

const DropdownContext = createContext();

export const DropdownProvider = ({ children }) => {
const [dropDownOptions, setDropDownOptions] = useState(null);
const [dropDownActive, setDropDownActive] = useState(false);


  return (
    <DropdownContext.Provider value={{dropDownOptions, setDropDownOptions, dropDownActive, setDropDownActive}}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
};