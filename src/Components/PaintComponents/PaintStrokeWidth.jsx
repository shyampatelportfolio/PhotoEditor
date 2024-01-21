import React from 'react'

export default function PaintStrokeWidth() {
    function handleStrokeChange(e){
        const valueDiv = document.querySelector('.pencil-actionbar-stroke-value')
        valueDiv.textContent = `Stroke : ${e.target.value}`
    }
  return (
    <div className="pencil-actionbar-stroke-container">
        <div className="pencil-actionbar-stroke-value">Stroke : 10</div>
        <input className="pencil-actionbar-stroke-value-input" onChange={handleStrokeChange} type="range" min={0} max={40} defaultValue={10}/>

    </div>
  )
}
