import React from 'react'
import { getRGBA } from '../../Functions/Functions';
export default function PaintPallette() {

    
  function handleColorChange(e){
    const input = e.target.closest('.photoshop-body-toolbar-color-container').querySelector('.photoshop-body-toolbar-color-input')
    if(input) input.click()
  }
  function handleColorChangeInput(e){
    const hexColor = e.target.value;
    const rgba = getRGBA(hexColor)
    const colorDiv = document.querySelector('.photoshop-body-toolbar-color')
    colorDiv.style.backgroundColor = rgba
  }
  return (
    <div onClick={handleColorChange} className="photoshop-body-toolbar-color-container">
        <div className="photoshop-body-toolbar-color">
        </div>
        <input onChange={handleColorChangeInput} className="photoshop-body-toolbar-color-input" type="color" />
    </div>
  )
}
