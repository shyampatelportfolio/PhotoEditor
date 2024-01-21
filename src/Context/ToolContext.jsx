import React, { createContext, useContext, useEffect, useState } from 'react';

const ToolContext = createContext();

export const ToolProvider = ({ children }) => {
  const [tool, setTool] = useState('drag');
const [currentItems, setCurrentItems] = useState([]);

  useEffect(() => {
    toggleClassListTool(tool)
  }, [tool])
  useEffect(() => {
  }, [currentItems])

  function toggleClassListTool(tool){
    const items = Array.from(document.querySelectorAll('.photoshop-body-toolbar-tool.selected'))
    items.forEach(x => {
      x.classList.remove('selected')
    })
    const targetItem = document.querySelector(`[data-tool="${tool}"].photoshop-body-toolbar-tool`)
    if(targetItem){
      targetItem.classList.toggle('selected')
    }
    
  }
  function toggleDragCorners(){

  }

  return (
    <ToolContext.Provider value={{ tool, setTool, currentItems, setCurrentItems }}>
      {children}
    </ToolContext.Provider>
  );
};

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
};