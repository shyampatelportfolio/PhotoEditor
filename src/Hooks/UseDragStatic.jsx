import { useRef, useEffect, useState } from 'react'
import { getSkew, findAggregateMatrix, findAggregateMatrixParent, composeMatrixArray,  writeMatrix, InverseComposeMatrixArray } from '../Functions/Functions'



export default function useDragStatic(itemRef){



  const mouseStorage = useRef()
  const offset = useRef({ x : 0, y : 0})

  const [dragActive, setDragActive] = useState(true)


  useEffect(() => {
    console.log(222)
    itemRef.current.classList.add('under-transform')
  }, [])



  function handleMouseDownDrag(e){
    if(!dragActive) return
    startDrag(e)
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
 

  function startDrag(e){
    setMouseStorageDrag(e)
    document.body.style.userSelect = 'none';
    window.addEventListener('mouseup', stopDrag, { once : true})
    window.addEventListener('mousemove', handleDrag);
  }
  function handleDrag(e){
    e.preventDefault()
    const matrix = getOffsetDrag(e)
    transform(matrix)

  };
  function stopDrag(e){
    document.body.style.userSelect = 'auto';
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
