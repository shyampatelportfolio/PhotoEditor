import React from 'react'
import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import html2canvas from 'html2canvas';
import useLasso from '../Hooks/useLasso';
import usePencil from '../Hooks/usePencil';
import useDrag from '../Hooks/useDrag';



export default function Canvas({myWidth, myHeight, toolProp}) {
  
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);


  const [handleMouseDownLasso, clearLasso] = useLasso(canvasRef, canvasWrapperRef)
  const [handleMouseDownPencil, clearPencil] = usePencil(canvasRef, canvasWrapperRef)
  const [handleMouseDownDrag, toggleDrag] = useDrag(canvasWrapperRef)
  // const [handleMouseDownDragImage, toggleDragImage] = useDrag(imageRef)


  const [tool, setTool] = useState('drag')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');

    if(myHeight & myWidth){
        canvas.width = myWidth;
        canvas.height = myHeight;
        ctx.canvas.width = myWidth;
        ctx.canvas.height = myHeight;
    }else{
        ctx.canvas.width = canvas.clientWidth;
        ctx.canvas.height = canvas.clientHeight;
    }

  }, [])
  useEffect(() => {
    handleToolChange(toolProp)
  }, [toolProp])

  function handleMouseDownCanvas(e){

    if( tool == 'lasso') handleMouseDownLasso(e)
    if( tool == 'pencil') handleMouseDownPencil(e)
    if( tool == 'drag'){
      const classname = e.target.parentNode.classList.contains('canvas-image-container')
      if(classname) handleMouseDownDragImage(e)
      else handleMouseDownDrag(e)
    }
  }
  function handleToolChange(e){
    if( tool == 'drag') toggleDrag()
    setTool(e)
    if( e == 'drag') toggleDrag()

  }



  return (
    <div
    ref={canvasWrapperRef}
    onMouseDown={handleMouseDownCanvas}
    
    className="canvas-wrapper">
        {/* <div ref={imageRef} className='canvas-image-container'>
          <img className='canvas-image' src="/Images/Scene1.jpg" alt="" draggable="false"/>
        </div> */}
        <div className="canvas-tools">
            <div onClick={() => handleToolChange('lasso')}>Lasso</div>
            <div onClick={() => handleToolChange('pencil')}>Pencil</div>
            <div onClick={() => handleToolChange('drag')}>Drag</div>
        </div>
          <canvas ref={canvasRef}
          className='canvas'
            />
    </div>
  )
}
