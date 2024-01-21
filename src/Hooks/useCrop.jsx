import { useRef, useEffect, useState } from 'react'

import {calculateSquare, findAggregateMatrix, findAggregateMatrixParent, InverseComposeMatrixArrayNew, composeMatrix, createTransformationMatrixSkew, getMatrixDestructured, multiplyMatrices, dotProduct, absoluteValue, calculateModulus, getTransform, getAngle, findInverseMatrix, applyMatrixTransform, getSkew, calculateInverseMatrix, composeMatrixArray, writeMatrix, InverseComposeMatrixArray, calculateInverseMatrixArray } from '../Functions/Functions'

import { useTool } from '../Context/ToolContext';
import { useAction } from '../Context/ActionsContext';


export default function useCrop(itemRef){

  
  const cropCanvas = useRef()
  const cropMatrix = useRef()
  const mouseStorage = useRef()
  const offset = useRef({ x : 0, y : 0})

  const [cropActive, setCropActive] = useState(true)
  const {action, setAction} = useAction()

  const { tool, setTool, currentItems, setCurrentItems } = useTool();

  useEffect(() => {
    itemRef.current.classList.add('cropable')
    createDivCrop()
    createCanvas()
  }, [])

  useEffect(() => {
    inspectCrop(tool, currentItems)
  }, [tool])

  useEffect(() => {
    inspectCrop(tool, currentItems)
  }, [currentItems])

  useEffect(() => {
    if(action.dispatch == 'crop' && tool == 'crop'){
      crop()
    }
  }, [action])

  function inspectCrop(tool, currentItems){
    if(tool !== 'crop'){
      cancelCrop()
    }
    const currentId = Number(itemRef.current.dataset.id)
    const bool = currentItems.includes(currentId)
    if(tool == 'crop' && bool){
      enableCrop()
    }
    if(tool == 'crop' && !bool){
      cancelCrop()
    }
  }






  function handleMouseDownCrop(e){
    if(!cropActive) return
    const bool2 = e.target.classList.contains('crop-corner')
    if(bool2) startCrop(e)
  }
  function cancelCrop(){
    const dragRegion = itemRef.current.querySelector('.crop-region')
    dragRegion.classList.add('hide')
    setCropActive(false)
    itemRef.current.classList.remove('cropable')

  }
  function enableCrop(){
    const dragRegion = itemRef.current.querySelector('.crop-region')
    dragRegion.classList.remove('hide')
    setCropActive(true)
    itemRef.current.classList.add('cropable')

  }
  function createDivCrop(){
    const cropRegion = document.createElement('div')
    cropRegion.classList += 'crop-region'
    const div1 = document.createElement('div')
    div1.classList += 'bottom-left-corner crop-corner'
    const div2 = document.createElement('div')
    div2.classList += 'bottom-right-corner crop-corner'
    const div3 = document.createElement('div')
    div3.classList += 'top-right-corner crop-corner'
    const div4 = document.createElement('div')
    div4.classList += 'top-left-corner crop-corner'
    cropRegion.append(div1)
    cropRegion.append(div2)
    cropRegion.append(div3)
    cropRegion.append(div4)
    itemRef.current.append(cropRegion)


  }



  function getCorner(e){
    const className = e.target.className
    const classes = className.split(' ')
    return classes[0]
  }
  function getCornerRedirector(corner){
    const redirector = {
      xRedirector : 1,
      yRedirector : 1,
    }
    if(corner == 'bottom-right-corner'){
      redirector.xRedirector = 1
      redirector.yRedirector = 1
    }
    if(corner == 'bottom-left-corner'){
      redirector.xRedirector = -1
      redirector.yRedirector = 1
    }
    if(corner == 'top-right-corner'){
      redirector.xRedirector = 1
      redirector.yRedirector = -1
    }
    if(corner == 'top-left-corner'){
      redirector.xRedirector = -1
      redirector.yRedirector = -1
    }
    return redirector

  }
  function createCanvas(){
    const canvas = document.createElement('canvas')
    cropCanvas.current = canvas
    canvas.classList.add('crop-canvas')

    itemRef.current.append(canvas)
  }


  

  //inital size -> crop -> download -> replace img -> scale back
  // is h - skewx*h better for handleresize?
  // whenever you use pixels you wont get responsive here


  // dont need crop matrix? we have A, and also e.clientX
  // dont need crop matrix? we have A, and also e.clientX CHANGE THIS PLEASE, just find the matrix
  // that takes A to e.clientX... dont need offset or cropMatrix...


  function crop(){
    if(!cropActive) return
    const canvasItem = itemRef.current.querySelector('.layer-canvas')
    const canvasImage1 = canvasItem.toDataURL('image/png');

    const croppedImage = new Image();
    croppedImage.src = canvasImage1
    croppedImage.onload = () => {

      const cropRegion = itemRef.current.querySelector('.crop-region')
      const [a2, b2, c2, d2, e2, f2] = getTransform(cropRegion)
      const [skewXCrop, skewYCrop] = getSkew([a2, b2, c2, d2, e2, f2])

      const height = Number(getComputedStyle(canvasItem).height.slice(0,-2))
      const width = Number(getComputedStyle(canvasItem).width.slice(0,-2))
      const ctx2 = canvasItem.getContext('2d');
      ctx2.globalCompositeOperation = 'source-over';

      const initialX = ((width*(1-skewXCrop))/2) + e2
      const initialY = ((height*(1-skewYCrop))/2) + f2
      const initialCropWidth = width*skewXCrop
      const initialCropHeight = height*skewYCrop

      const cropWidth = initialCropWidth
      const cropHeight = initialCropHeight

      const x = initialX
      const y = initialY

      console.log(width, ctx2.canvas.width)

      const canvas = cropCanvas.current;
      const context = canvas.getContext('2d');
      canvas.style.width = `${cropWidth}px`
      canvas.style.height = `${cropHeight}px`
      context.canvas.width = canvas.clientWidth;
      context.canvas.height = canvas.clientHeight;

        context.clearRect(0, 0,canvas.clientWidth, canvas.clientHeight);
        context.drawImage(croppedImage, -x, -y);

        const canvasImage = canvas.toDataURL('image/png');

        const cropMatrix = getTransform(cropRegion)
        const outerMatrix = getTransform(itemRef.current)
        //can just get aggregate cropMatrix
        const [a3,b3,c3,d3,e3,f3] = composeMatrixArray(outerMatrix,cropMatrix)
        const adjustedMatrix = `matrix(${a3},${b3},${c3},${d3},${e3},${f3})`
        itemRef.current.style.transform = adjustedMatrix
        const croppedImage2 = new Image();

        croppedImage2.src = canvasImage
        croppedImage2.onload = () => {
          ctx2.clearRect(0, 0,canvasItem.clientWidth, canvasItem.clientHeight);
          ctx2.drawImage(croppedImage2, 0, 0,canvasItem.clientWidth, canvasItem.clientHeight);
        };




    
        transform([1,0,0,1,0,0])
    };
  }


  function startCrop(e){
    setMouseStorageCrop(e)
    setOffset(e)
    window.addEventListener('mouseup', stopCrop, { once : true})
    window.addEventListener('mousemove', handleCrop);
  }
  function handleCrop(event){
    const [a,b,c,d,e,f] = getCropMatrix()

    const X = calculateSquare(a,b)
    const Y = calculateSquare(c,d)
    
    const [deltaOffsetX, deltaOffsetY] = getOffset(event)

    const A = dotProduct(deltaOffsetX, deltaOffsetY, a, b)/X
    const B = dotProduct(deltaOffsetX, deltaOffsetY, c, d)/Y

    const u = mouseStorage.current.u
    const v = mouseStorage.current.v

     if( mouseStorage.current.direction == null){
      if(event.shiftKey){
        if( absoluteValue(A*(Math.sqrt(X))) > absoluteValue(B*(Math.sqrt(Y))) ) mouseStorage.current.direction = 'X'
        else mouseStorage.current.direction = 'Y'
      }else if(event.ctrlKey) mouseStorage.current.direction = 'Ctrl'
      else mouseStorage.current.direction = 'Both'
    }
    let newAggregateMatrix

    if(mouseStorage.current.direction == 'X'){
      const a2 = a*(u*A + 1)
      const b2 = b*(u*A + 1)
      const c2 = c
      const d2 = d
      const e2 = e + a*A/2
      const f2 = f + b*A/2
      newAggregateMatrix = [a2, b2, c2, d2, e2, f2]
    }
    else if(mouseStorage.current.direction == 'Y'){
      const a2 = a
      const b2 = b
      const c2 = c*(v*B + 1)
      const d2 = d*(v*B + 1)
      const e2 = e + c*B/2
      const f2 = f + d*B/2
      newAggregateMatrix = [a2, b2, c2, d2, e2, f2]
    }
    else if(mouseStorage.current.direction == 'Both'){
      const a2 = a*(u*A + 1)
      const b2 = b*(u*A + 1)
      const c2 = c*(v*B + 1)
      const d2 = d*(v*B + 1)
      const e2 = e + deltaOffsetX/2
      const f2 = f + deltaOffsetY/2
      newAggregateMatrix = [a2, b2, c2, d2, e2, f2]
    }
    else if(mouseStorage.current.direction == 'Ctrl'){
      const a2 = a*(u*A + 1)
      const b2 = b*(u*A + 1)
      const c2 = c*(u*A + 1)
      const d2 = d*(u*A + 1)
      const e2 = e + A*(a + c*u/v)/2
      const f2 = f + A*(b + d*u/v)/2
      newAggregateMatrix = [a2, b2, c2, d2, e2, f2]
    }
    cropMatrix.current = newAggregateMatrix
    const transformMatrix = InverseComposeMatrixArray(newAggregateMatrix,mouseStorage.current.aggregateMatrixParent)
    transform(transformMatrix)

  }
  function stopCrop(event){
    window.removeEventListener('mousemove', handleCrop);
  }
  function getCropMatrix(){
    const cropRegion = itemRef.current.querySelector('.crop-region')
    const aggregateMatrix = findAggregateMatrix(cropRegion)
    return aggregateMatrix
  }

  function setMouseStorageCrop(event){
    const width = itemRef.current.offsetWidth
    const height = itemRef.current.offsetHeight
    const corner = getCorner(event)
    const redirector = getCornerRedirector(corner)
    const aggregateMatrixParent = findAggregateMatrix(itemRef.current)

    cropMatrix.current = getCropMatrix()

    mouseStorage.current = {
      direction : null,
      aggregateMatrixParent : aggregateMatrixParent,
      u : redirector.xRedirector/width,
      v : redirector.yRedirector/height,
    }
  }
 



  function getOffset(e){
    const offsetX = e.clientX - offset.current.x + window.scrollX;
    const offsetY = e.clientY - offset.current.y + window.scrollY;
    setOffset(e)
    return [offsetX, offsetY]
  }
  function setOffset(e){
    offset.current.x = e.clientX + window.scrollX;
    offset.current.y = e.clientY + window.scrollY;
  }

  function transform(transformMatrix){
    const cropRegion = itemRef.current.querySelector('.crop-region')
    const writenMatrix = writeMatrix(transformMatrix)
    cropRegion.style.transform = writenMatrix
    const [skewX, skewY] = getSkew(transformMatrix)
    const matrixSkew = createTransformationMatrixSkew(skewX, skewY)
    const corners = Array.from(itemRef.current.querySelectorAll('.crop-corner'))
    corners.forEach(element => {
      element.style.transform = matrixSkew
    });
  }



    return [handleMouseDownCrop]
}