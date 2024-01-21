import { useState } from 'react'
import './Css/Css1.css'
import { Route, Routes } from "react-router-dom"
import Home from './Pages/Home'
import { ToolProvider } from './Context/ToolContext'
import { ActionProvider } from './Context/ActionsContext'
import { DropdownProvider } from './Context/DropdownContext'
function App() {

  return (
    <>
      <DropdownProvider>
        <ActionProvider>
          <ToolProvider>
            <Routes>
                <Route path='/' element={<Home></Home>}></Route>
            </Routes>
          </ToolProvider>
        </ActionProvider>
      </DropdownProvider>
    </>
  )
}

export default App
