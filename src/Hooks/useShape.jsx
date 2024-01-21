

import { useRef, useState, useEffect, useContext, useCallback } from 'react'

import { getRGBAOpacity, findAggregateMatrix, InverseComposeMatrixArray, getBox, getCenter, findInverseMatrix, applyMatrixTransform, findOldOrigin, getTransform } from '../Functions/Functions'
import { useTool } from '../Context/ToolContext';
import { useAction } from '../Context/ActionsContext';


export default function useShape(canvasRef, canvasWrapperRef){

    const shapePoints = useRef([])
    const mouseStorage = useRef()
    const { tool, setTool, currentItems, setCurrentItems } = useTool();
    const [shapeActive, setShapeActive] = useState(false)
    const {action, setAction} = useAction()
    const [imageSrc, setImageSrc] = useState()
    useEffect(() => {
        inspectShape(tool, currentItems)
    }, [tool])

    useEffect(() => {
        inspectShape(tool, currentItems)
    }, [currentItems])
    useEffect(() => {
        if(action.dispatch == 'shapeLayer') handleShapeLayer()
        if(action.dispatch == 'shapeErase') handleShapeDelete()
        if(action.dispatch == 'closePath') handleClosePath()


    }, [action])
  

    function handleShapeLayer(){
        if(!isShape) return
        if(currentItems.length == 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
    
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(shapePoints.current[0].x, shapePoints.current[0].y);
            for (let i = 1; i < shapePoints.current.length; i++) {
                ctx.lineTo(shapePoints.current[i].x, shapePoints.current[i].y);
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
            dispatch : 'shapeLayerDuplicate',
            params : {
              parent : parentId,
              child : childId
            }
          })
        };
    }
    function handleShapeDelete(){
        if(!isShape) return
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
          
          ctx.moveTo(shapePoints.current[0].x, shapePoints.current[0].y);
              for (let i = 1; i < shapePoints.current.length; i++) {
                  ctx.lineTo(shapePoints.current[i].x, shapePoints.current[i].y);
              }
          ctx.closePath()
          ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Fully transparent black
          ctx.fill();

          setAction({
              dispatch : 'shapeLayerDuplicate',
              params : {
                parent : parentId,
                child : childId
              }
          })
        };
    }



    function inspectShape(tool){
        const currentId = Number(canvasWrapperRef.current.dataset.id)
        const bool = currentItems.includes(currentId)
        if(tool == 'shape' && bool){
            enableShape()
        }else{
            disableShape()
        }
    }

    function enableShape(){
        setShapeActive(true)
        canvasWrapperRef.current.classList.remove('no-pointers')
    }
    function disableShape(){
        setShapeActive(false)
    }

    function handleMouseDownShape(e){
        if(!shapeActive) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
       
        if(shapePoints.current.length == 0){
            setCanvasStorage(e)
            const [x, y] = getCanvasCoordinates(e)
            shapePoints.current = [{x, y}]
            const canvasImage = canvas.toDataURL('image/png');
            setImageSrc(canvasImage)
     
        }
    
        const image = new Image();
        image.src = imageSrc
        image.onload = () => {
        
            const [x, y] = getCanvasCoordinates(e)
    
            const newArray = [...shapePoints.current, {x,y}]
            shapePoints.current = newArray

            const opacityInput = document.querySelector('.pencil-actionbar-opacity-value-input')
            const opacity = opacityInput.value
            const strokeInput = document.querySelector('.pencil-actionbar-stroke-value-input')
            const stroke = strokeInput.value
            const colorPallete2 = document.querySelector('.photoshop-body-toolbar-color-input')
            const color2 = colorPallete2.value
            const rgba = getRGBAOpacity(color2, opacity/100)
            
            ctx.strokeStyle = `${rgba}`;
            ctx.lineWidth = `${stroke}`;
            ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height) // Example drawing operation
            ctx.drawImage(image, 0,0,ctx.canvas.width,ctx.canvas.height);
    
    
            ctx.beginPath();
            ctx.moveTo(shapePoints.current[0].x, shapePoints.current[0].y);
                for (let i = 1; i < shapePoints.current.length; i++) {
                    ctx.lineTo(shapePoints.current[i].x, shapePoints.current[i].y);
                }
            ctx.stroke();
        }

    }
    function handleClosePath(){
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d");
       
        const image = new Image();
        image.src = imageSrc
        image.onload = () => {
        

            const opacityInput = document.querySelector('.pencil-actionbar-opacity-value-input')
            const opacity = opacityInput.value
            const strokeInput = document.querySelector('.pencil-actionbar-stroke-value-input')
            const stroke = strokeInput.value
            const colorPallete2 = document.querySelector('.photoshop-body-toolbar-color-input')
            const color2 = colorPallete2.value
            const rgba = getRGBAOpacity(color2, opacity/100)
            
            ctx.strokeStyle = `${rgba}`;
            ctx.lineWidth = `${stroke}`;
            ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height) // Example drawing operation
            ctx.drawImage(image, 0,0,ctx.canvas.width,ctx.canvas.height);
    
    
            ctx.beginPath();
            ctx.moveTo(shapePoints.current[0].x, shapePoints.current[0].y);
                for (let i = 1; i < shapePoints.current.length; i++) {
                    ctx.lineTo(shapePoints.current[i].x, shapePoints.current[i].y);
                }
            ctx.closePath()
            ctx.stroke();
            shapePoints.current = []
            const canvasImage = canvas.toDataURL('image/png');
            setImageSrc(canvasImage)
        }
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




    return [handleMouseDownShape]
}