import React from 'react'
import PaintActionBar from './PaintActionBar'
import { useAction } from '../Context/ActionsContext'

export default function Header() {
  const {action, setAction} = useAction()

  function handleDownload(){
    setAction(
        {
          name: 'Export Layers',
          dispatch : 'exportLayers',
          params : `null`
        }
    )
  
  }
  return (
    <div className="photoshop-header">
        <div onClick={handleDownload} className="header-download">
            <img src="/Svg/Download.svg" alt="" />
            <div className="header-download-name">Download</div>
        </div>
    </div>
    
  )
}
