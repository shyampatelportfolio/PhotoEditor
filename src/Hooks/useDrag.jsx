import { useRef, useEffect, useState } from 'react'
import { getSkew, findAggregateMatrix, findAggregateMatrixParent, getCenter, dotProduct, absoluteValue, calculateAngle, getTransform, getAngle, calculateModulus, composeMatrix, composeMatrixArray, calculateInverseMatrixArray, writeMatrix, composeMatrixArrayNew, InverseComposeMatrixArrayNew, calculateSquare, multiplyMatrices, InverseComposeMatrixArray } from '../Functions/Functions'

import { useTool } from '../Context/ToolContext';


export default function useDrag(itemRef){


  const { tool, setTool, currentItems, setCurrentItems } = useTool();

  const mouseStorage = useRef()
  const offset = useRef({ x : 0, y : 0})

  const [dragActive, setDragActive] = useState(false)


  useEffect(() => {
    itemRef.current.classList.add('under-transform')
    createDivDrag()
  }, [])

  useEffect(() => {
    inspectDrag(tool, currentItems)
  }, [tool])

  useEffect(() => {
    inspectDrag(tool, currentItems)
  }, [currentItems])

  function inspectDrag(tool, currentItems){
    const currentId = Number(itemRef.current.dataset.id)
    const bool = currentItems.includes(currentId)
    const toolBool = getToolBool()
    const stampBool = getStampBool()
    checkShapes()
    if(toolBool){
      cancelDrag()
      if(bool){
        //since crop tool needs pointers
        itemRef.current.classList.remove('no-pointers')
      }
    }
    if(!toolBool && bool){
        enableDrag()
    }
    if(!toolBool && stampBool){
      enableDrag()
    }
    if(!toolBool && !bool){
      if(tool !== 'stamp'){
        cancelDrag()
      }
    }
  }

  function checkShapes(){
    const parentNode = itemRef.current.parentNode
    if(parentNode.classList.contains('layer')){
      parentNode.classList.remove('no-pointers')
    }
  }
  function getToolBool(){
    const toolBool = tool !== 'drag' && tool !== 'stamp' && tool !== 'circle'
    return toolBool
  }
  function getStampBool(){
  const currentId = Number(itemRef.current.dataset.id)
  const stampItems = [...document.querySelectorAll('.stamp')]
  const stampItemsId = stampItems.map(x => Number(x.dataset.id))
  const stampBool = stampItemsId.includes(currentId)
  return stampBool
  }
 


  function handleMouseDownDrag(e){
    if(!dragActive) return
    const bool = e.target.classList.contains('drag-rotate')
    const bool2 = e.target.classList.contains('drag-corner')
    if(bool) startRotate(e)
    else if(bool2) startResize(e)
    else startDrag(e)
  }
  function cancelDrag(){
    const dragRegion = itemRef.current.querySelector('.drag-region')
    dragRegion.classList.add('hide')
    itemRef.current.classList.add('no-pointers')

    setDragActive(false)
  }
  function enableDrag(){
    const dragRegion = itemRef.current.querySelector('.drag-region')
    dragRegion.classList.remove('hide')
    itemRef.current.classList.remove('no-pointers')

    setDragActive(true)
  }
  function createDivDrag(){
    const dragRegion = document.createElement('div')
    dragRegion.classList += 'drag-region draggable'
    const dragRotate = document.createElement('div')
    dragRotate.classList += 'drag-rotate'
    const div1 = document.createElement('div')
    div1.classList += 'bottom-left-corner drag-corner'
    const div2 = document.createElement('div')
    div2.classList += 'bottom-right-corner drag-corner'
    const div3 = document.createElement('div')
    div3.classList += 'top-right-corner drag-corner'
    const div4 = document.createElement('div')
    div4.classList += 'top-left-corner drag-corner'
    dragRegion.append(div1)
    dragRegion.append(div2)
    dragRegion.append(div3)
    dragRegion.append(div4)
    dragRegion.append(dragRotate)

    itemRef.current.append(dragRegion)
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


  function startResize(e){
    
    setMouseStorageResize(e)
    setOffset(e)
    window.addEventListener('mouseup', stopResize, { once : true})
    window.addEventListener('mousemove', handleResize);
  }
  function handleResize(event){

    const [a,b,c,d,e,f] = findAggregateMatrix(itemRef.current)
    
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
    const transformMatrix = InverseComposeMatrixArray(newAggregateMatrix,mouseStorage.current.aggregateMatrixParent)
    transform(transformMatrix)
  }
  function stopResize(e){
    window.removeEventListener('mousemove', handleResize);
  }
 

  function startDrag(e){
    setMouseStorageDrag(e)
    window.addEventListener('mouseup', stopDrag, { once : true})
    window.addEventListener('mousemove', handleDrag);
  }
  function handleDrag(e){
    e.preventDefault()
    const matrix = getOffsetDrag(e)
    transform(matrix)

  };
  function stopDrag(e){
    window.removeEventListener('mousemove', handleDrag);
  };


  function getOffsetDrag(e){
    const offsetX = e.clientX - mouseStorage.current.x;
    const offsetY = e.clientY - mouseStorage.current.y;
    const adjustingMatrix = [1,0,0,1,offsetX,offsetY]
    const newAggregateMatrix = composeMatrixArray(adjustingMatrix, mouseStorage.current.aggregateMatrix)
    const transformMatrix = InverseComposeMatrixArray(newAggregateMatrix,mouseStorage.current.aggregateMatrixParent)
  
    return transformMatrix
  }
  function setMouseStorageDrag(event){
    const aggregateMatrixParent = findAggregateMatrixParent(itemRef.current)
    const aggregateMatrix = findAggregateMatrix(itemRef.current, true)
    mouseStorage.current = {
      x: event.clientX,
      y: event.clientY,
      aggregateMatrixParent : aggregateMatrixParent,
      aggregateMatrix : aggregateMatrix
    }

  }



  function startRotate(e){
    setMouseStorageRotate(e)
    window.addEventListener('mouseup', stopRotate, { once : true})
    window.addEventListener('mousemove', handleRotate);
  }
  function handleRotate(e){
    const matrix = getOffsetRotate(e)
    transform(matrix)
  }
  function stopRotate(e){
    window.removeEventListener('mousemove', handleRotate);
    
  }


  function getOffsetRotate(e){
    const offsetXNew = e.clientX - mouseStorage.current.center.x + window.scrollX;
    const offsetYNew = e.clientY - mouseStorage.current.center.y + window.scrollY;
    const offsetX = mouseStorage.current.startPosition.offsetX
    const offsetY = mouseStorage.current.startPosition.offsetY

    const angleDelta = calculateAngle(offsetX, offsetY, offsetXNew, offsetYNew)
    const adjustingMatrix = createTransformationMatrix(angleDelta,0,0,1,1)
    const newAggregateMatrix = composeMatrixArrayNew(mouseStorage.current.aggregateMatrix, adjustingMatrix)
    const transformMatrix = InverseComposeMatrixArray(newAggregateMatrix,mouseStorage.current.aggregateMatrixParent)
    
    return transformMatrix
  }
  function setMouseStorageRotate(event){
    const aggregateMatrixParent = findAggregateMatrixParent(itemRef.current)
    const aggregateMatrix = findAggregateMatrix(itemRef.current)

    // is get center valid for nested divs?
    const [centerX, centerY] = getCenter(itemRef.current)
    const center = {
      x : centerX,
      y : centerY
    }
    const startPosition = {
      offsetX: event.clientX + window.scrollX - centerX,
      offsetY: event.clientY + window.scrollY - centerY,
    };
    mouseStorage.current = {
      center : center,
      startPosition : startPosition,
      aggregateMatrixParent : aggregateMatrixParent,
      aggregateMatrix : aggregateMatrix
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


  //  and add ctrl and shift for diagnol and horizontal
  // just use matrix form, dont use const [a,b,c,d,e,f]



  // this composition logic doesnt work...
  // but then why does it work in crop? maybe because its only resize and no rotate?
 


  function setMouseStorageResize(event){
    const width = itemRef.current.offsetWidth
    const height = itemRef.current.offsetHeight
    const corner = getCorner(event)
    const redirector = getCornerRedirector(corner)
    const aggregateMatrixParent = findAggregateMatrixParent(itemRef.current)

    mouseStorage.current = {
      direction : null,
      aggregateMatrixParent : aggregateMatrixParent,
      u : redirector.xRedirector/width,
      v : redirector.yRedirector/height,
    }
  }


  function transform(matrixProp){
    itemRef.current.style.transform = writeMatrix(matrixProp)
    const [skewX, skewY] = getSkew(matrixProp)
    const matrixSkew = createTransformationMatrixSkew(skewX, skewY)
    const dragCorners = Array.from(itemRef.current.querySelectorAll('.drag-corner, .drag-rotate'))
    dragCorners.forEach(element => {
      element.style.transform = matrixSkew
    });
    const cropCorners = Array.from(itemRef.current.querySelectorAll('.crop-corner'))
    cropCorners.forEach(element => {
      element.style.transform = matrixSkew
    });
  }
  function createTransformationMatrix(B, x, y, skewX, skewY){
    const cosB = Math.cos(B);
    const sinB = Math.sin(B);
    const a = cosB;
    const b = sinB;
    const c = -sinB;
    const d = cosB;
    const e = x;
    const f = y;
    const matrix = [skewX*a,skewX*b,skewY*c,skewY*d,e,f]
  
    return matrix;
  };
  function createTransformationMatrixSkew(skewX, skewY){
    const a = 1/skewX
    const b = 0
    const c = 0
    const d = 1/skewY
    const matrix = `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`
    return matrix
  }


    return [handleMouseDownDrag, cancelDrag, enableDrag]
}
