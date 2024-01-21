import React from 'react'

export default function PaintOpacity() {
    function handleOpacityChange(e){
        const valueDiv = document.querySelector('.pencil-actionbar-opacity-value')
        valueDiv.textContent = `Opacity : ${e.target.value}%`
    }
  return (
    <div className="pencil-actionbar-opacity-container">
        <div className="pencil-actionbar-opacity-value">Opacity : 100%</div>
        <input className="pencil-actionbar-opacity-value-input" onChange={handleOpacityChange} type="range" min={0} max={100} defaultValue={100}/>
    </div>
  )
}
