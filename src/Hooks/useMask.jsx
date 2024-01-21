import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { getRGBAOpacity, getBox, getCenter, findInverseMatrix, applyMatrixTransform, findOldOrigin, getTransform } from '../Functions/Functions'
import { useTool } from '../Context/ToolContext';


export default function useMask(canvasRef, canvasWrapperRef){

    const pencilPoints = useRef([])
    const mouseStorage = useRef()
    const { tool, setTool, currentItems, setCurrentItems } = useTool();
    const [pencilActive, setPencilActive] = useState(false)

    useEffect(() => {
        inspectMask(tool, currentItems)
    }, [tool])

    useEffect(() => {
        inspectMask(tool, currentItems)
    }, [currentItems])

    function inspectMask(tool, currentItems){
        const currentId = Number(canvasWrapperRef.current.dataset.id)
        const bool = currentItems.includes(currentId)
        const toolBool = tool == 'mask'
        if(!toolBool){
          disableCanvas()
          if(bool){
            canvasWrapperRef.current.classList.remove('no-pointers')
          }
        }
        if(toolBool && bool){
            enableCanvas()
        }
        if(toolBool && !bool){
            disableCanvas()
        }
      }

    function disableCanvas(){
        resetCanvasGlobalOperation()
        setPencilActive(false)
    }
    function enableCanvas(){
        setPencilActive(true)
    }

    function resetCanvasGlobalOperation(){
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = 'source-over';

    }




    function handleMouseDownMask(e){
        if(!pencilActive) return
        
        setCanvasStorage(e)
        const [x, y] = getCanvasCoordinates(e)

        pencilPoints.current = [{x, y}]

        window.addEventListener('mouseup', stopPencil, { once : true})
        window.addEventListener('mousemove', handlePencil);
    }

    function handlePencil(e){
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");

            const [x, y] = getCanvasCoordinates(e)
            const newArray = [...pencilPoints.current, {x,y}]
         
            pencilPoints.current = newArray
    

            const opacityInput = document.querySelector('.pencil-actionbar-opacity-value-input')
            const opacity = opacityInput.value
            const strokeInput = document.querySelector('.pencil-actionbar-stroke-value-input')
            const stroke = strokeInput.value
            const colorPallete2 = document.querySelector('.photoshop-body-toolbar-color-input')
            const color2 = colorPallete2.value
            const rgba = getRGBAOpacity(color2, opacity/100)
            ctx.strokeStyle = `${rgba}`;
            ctx.lineWidth = `${stroke}`;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
     
            ctx.moveTo(pencilPoints.current[0].x, pencilPoints.current[0].y);
                for (let i = 1; i < pencilPoints.current.length; i++) {
                    ctx.lineTo(pencilPoints.current[i].x, pencilPoints.current[i].y);
                }
            ctx.stroke();
    }
    function stopPencil(e){
        window.removeEventListener('mousemove', handlePencil);
    }
  


    function clearMask(){
        pencilPoints.current = []
    }




    function getCanvasCoordinates(event){
        const [a,b,c,d,e,f,leftOld,topOld,centerX,centerY, scaleFactorX, scaleFactorY] = getCanvasStorage()
        const x = event.clientX + window.scrollX;
        const y = event.clientY + window.scrollY;
        const [x2, y2] = applyMatrixTransform(a,b,c,d,0,0,x-e,y-f,centerX,centerY)
        const xFinal = (x2 - leftOld)*scaleFactorX
        const YFinal = (y2 - topOld)*scaleFactorY

        return [xFinal,YFinal]
    }
    function setCanvasStorage(){
        const [a, b, c, d, e, f] = getTransform(canvasWrapperRef.current)
        const [a1, b1, c1, d1] = findInverseMatrix(a,b,c,d)
        const [w, z] = getCenter(canvasWrapperRef.current)
        const [centerX, centerY] = findOldOrigin(e,f,w,z)
        const [left, top] = getBox(canvasWrapperRef.current)
        const [leftOld, topOld] = applyMatrixTransform(a1,b1,c1,d1,0,0,left-e,top-f,centerX,centerY)
        

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
        const canvasWidth = canvas.clientWidth
        const ctxWidth = ctx.canvas.width
        const canvasHeight = canvas.clientHeight
        const ctxHeight = ctx.canvas.height
        const scaleFactorX = ctxWidth/canvasWidth
        const scaleFactorY = ctxHeight/canvasHeight


        mouseStorage.current = {
            leftOld : leftOld,
            topOld : topOld,
            centerX : centerX,
            centerY : centerY,
            matrix : [a1, b1, c1, d1, e, f],
            scaleFactorX : scaleFactorX,
            scaleFactorY : scaleFactorY
        }
    }
    function getCanvasStorage(){
        const a = mouseStorage.current.matrix[0]
        const b = mouseStorage.current.matrix[1]
        const c = mouseStorage.current.matrix[2]
        const d = mouseStorage.current.matrix[3]
        const e = mouseStorage.current.matrix[4]
        const f = mouseStorage.current.matrix[5]
        const leftOld = mouseStorage.current.leftOld
        const topOld = mouseStorage.current.topOld
        const centerX = mouseStorage.current.centerX
        const centerY = mouseStorage.current.centerY
        const scaleFactorX = mouseStorage.current.scaleFactorX
        const scaleFactorY = mouseStorage.current.scaleFactorY

        return [a,b,c,d,e,f,leftOld,topOld,centerX,centerY, scaleFactorX, scaleFactorY]
    }




    return [handleMouseDownMask, clearMask]
}