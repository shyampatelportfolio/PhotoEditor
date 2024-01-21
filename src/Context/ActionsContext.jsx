import React, { createContext, useContext, useEffect, useState } from 'react';

const ActionContext = createContext();

export const ActionProvider = ({ children }) => {
    const [action, setAction] = useState({
      dispatch : null
    });



  return (
    <ActionContext.Provider value={{ action, setAction}}>
      {children}
    </ActionContext.Provider>
  );
};

export const useAction = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
};