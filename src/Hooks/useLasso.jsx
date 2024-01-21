

import { useRef, useState, useEffect, useContext, useCallback } from 'react'

import { findAggregateMatrix, InverseComposeMatrixArray, getBox, getCenter, findInverseMatrix, applyMatrixTransform, findOldOrigin, getTransform } from '../Functions/Functions'
import { useTool } from '../Context/ToolContext';
import { useAction } from '../Context/ActionsContext';


export default function useLasso(canvasRef, canvasWrapperRef){

    const lassoPoints = useRef([])
    const mouseStorage = useRef()
    const { tool, setTool, currentItems, setCurrentItems } = useTool();
    const [lassoActive, setLassoActive] = useState(false)
    const [isLasso, setIsLasso] = useState(false)
    const {action, setAction} = useAction()

    useEffect(() => {
        if(!isLasso) return
        inspectLasso(tool, currentItems)
    }, [tool])

    useEffect(() => {
        if(isLasso)
        inspectLasso(tool, currentItems)

    }, [isLasso])
    useEffect(() => {
        if(action.dispatch == 'lassoLayer') handleLassoLayer()
        if(action.dispatch == 'lassoErase') handleLassoDelete()

    }, [action])
  

    function handleLassoLayer(){
        if(!isLasso) return
        if(currentItems.length == 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
    
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(lassoPoints.current[0].x, lassoPoints.current[0].y);
            for (let i = 1; i < lassoPoints.current.length; i++) {
                ctx.lineTo(lassoPoints.current[i].x, lassoPoints.current[i].y);
            }
        ctx.closePath()
        ctx.clip();
        
        const parentId = Number(canvasWrapperRef.current.dataset.id)
        const childId = currentItems[0]

        const child = document.querySelector(`[data-id="${childId}"].layer`)
        const newParent = document.querySelector(`[data-id="${parentId}"].layer`)
        const aggregateMatrixChild = findAggregateMatrix(child)
        const aggregateMatrixNewParent = findAggregateMatrix(newParent)
        const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)
    
        const canvasChild = child.querySelector('.layer-canvas')
        const canvasChildImage = canvasChild.toDataURL('image/png');
    
        const canvasChildWidth = canvasChild.clientWidth
        const canvasChildHeight = canvasChild.clientHeight
    
        const image = new Image();
        image.src = canvasChildImage
    
        image.onload = () => {
    
          const w = ctx.canvas.width / 2;
          const z = ctx.canvas.height / 2;
          const [a,b,c,d,e,f] = transformMatrix
          const e1 = -c*z + e + w*(1-a)
          const f1 = -b*w + f + z*(1-d)
          const transformMatrixNew = [a,b,c,d,e1,f1]
          const w1 = w - (canvasChildWidth/2)
          const z1 = z - (canvasChildHeight/2)
          ctx.setTransform(...transformMatrixNew);
          ctx.drawImage(image, w1,z1, canvasChildWidth, canvasChildHeight);
        
          ctx.setTransform(1, 0, 0, 1, 0, 0);
    
          setAction({
            dispatch : 'lassoLayerDuplicate',
            params : {
              parent : parentId,
              child : childId
            }
          })
        };
    }
    function handleLassoDelete(){
        if(!isLasso) return
        if(currentItems.length == 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
    
        ctx.clearRect(0, 0,canvas.clientWidth, canvas.clientHeight);
        
        const parentId = Number(canvasWrapperRef.current.dataset.id)
        const childId = currentItems[0]

        const child = document.querySelector(`[data-id="${childId}"].layer`)
        const newParent = document.querySelector(`[data-id="${parentId}"].layer`)
        const aggregateMatrixChild = findAggregateMatrix(child)
        const aggregateMatrixNewParent = findAggregateMatrix(newParent)
        const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)
    
        const canvasChild = child.querySelector('.layer-canvas')
        const canvasChildImage = canvasChild.toDataURL('image/png');
    
        const canvasChildWidth = canvasChild.clientWidth
        const canvasChildHeight = canvasChild.clientHeight
    
        const image = new Image();
        image.src = canvasChildImage
    
        image.onload = () => {
    
          const w = ctx.canvas.width / 2;
          const z = ctx.canvas.height / 2;
          const [a,b,c,d,e,f] = transformMatrix
          const e1 = -c*z + e + w*(1-a)
          const f1 = -b*w + f + z*(1-d)
          const transformMatrixNew = [a,b,c,d,e1,f1]
          const w1 = w - (canvasChildWidth/2)
          const z1 = z - (canvasChildHeight/2)
          ctx.setTransform(...transformMatrixNew);
          ctx.drawImage(image, w1,z1, canvasChildWidth, canvasChildHeight);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.beginPath();
          ctx.globalCompositeOperation = 'destination-out';
          
          ctx.moveTo(lassoPoints.current[0].x, lassoPoints.current[0].y);
              for (let i = 1; i < lassoPoints.current.length; i++) {
                  ctx.lineTo(lassoPoints.current[i].x, lassoPoints.current[i].y);
              }
          ctx.closePath()
          ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fully transparent black
          ctx.fill();

          setAction({
              dispatch : 'lassoLayerDuplicate',
              params : {
                parent : parentId,
                child : childId
              }
          })
        };
    }



    function inspectLasso(tool){
        if(tool == 'lasso'){
            enableLasso()
        }else{
            disableLasso()
        }
    }

    function enableLasso(){
        setLassoActive(true)
        canvasWrapperRef.current.classList.remove('no-pointers')
    }
    function disableLasso(){
        setAction({
            dispatch : 'deleteLayer',
            params : Number(canvasWrapperRef.current.dataset.id)
        })
        // setLassoActive(false)
        // canvasWrapperRef.current.classList.remove('no-pointers')
        // canvasWrapperRef.current.classList.add('no-pointers')
        // clearLasso()
    }

    function handleMouseDownLasso(e){
        if(!lassoActive) return
        setCanvasStorage(e)
        getTransform(canvasWrapperRef.current)
        const [x, y] = getCanvasCoordinates(e)
       

        lassoPoints.current = [{x, y}]
        window.addEventListener('mouseup', stopLasso, { once : true})
        window.addEventListener('mousemove', handleLasso);
    }
    


    function handleLasso(e, bool){
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
    
        const [x, y] = getCanvasCoordinates(e)


        const newArray = [...lassoPoints.current, {x,y}]
        lassoPoints.current = newArray

        
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
    
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(lassoPoints.current[0].x, lassoPoints.current[0].y);
            for (let i = 1; i < lassoPoints.current.length; i++) {
                ctx.lineTo(lassoPoints.current[i].x, lassoPoints.current[i].y);
            }
        if(bool){
            ctx.closePath()
        }
        ctx.stroke();
    }
    function stopLasso(e){
        handleLasso(e, true)
        window.removeEventListener('mousemove', handleLasso);
    }



    function clipLasso(){
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
        ctx.clip();

        const image = new Image();
        image.src = droppedImages[0]
        image.onload = () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
    }
    function clearLasso(){
        lassoPoints.current = []
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    function activateLasso(){
        setIsLasso(true)
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
        //this is wrong... see calculate inversematrix
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




    return [handleMouseDownLasso, clearLasso, activateLasso]
}