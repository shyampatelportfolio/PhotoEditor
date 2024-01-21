import React from 'react'
import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import useDrag from '../Hooks/useDrag';
import useCrop from '../Hooks/useCrop';
import useLasso from '../Hooks/useLasso';
import useShape from '../Hooks/useShape';
import usePencil from '../Hooks/usePencil';
import { useAction } from '../Context/ActionsContext';
import { handlePrintCanvas, getRGBAOpacity, writeMatrix, findAggregateMatrix, InverseComposeMatrixArray, getTransform } from '../Functions/Functions';
import { useTool } from '../Context/ToolContext';
import useMask from '../Hooks/useMask';


export default function Layer({id, content, type}) {

  const layerRef = useRef(null);
  const canvasRef = useRef(null);

  const [handleMouseDownMask, clearMask] = useMask(canvasRef, layerRef)
  const [handleMouseDownDrag, cancelDrag, enableDrag] = useDrag(layerRef)
  const [handleMouseDownCrop] = useCrop(layerRef)
  const [handleMouseDownPencil, clearPencil] = usePencil(canvasRef, layerRef)
  const [handleMouseDownLasso, clearLasso, activateLasso] = useLasso(canvasRef, layerRef)
  const [handleMouseDownShape] = useShape(canvasRef, layerRef)

  const {action, setAction} = useAction()
  const { tool, setTool, currentItems, setCurrentItems } = useTool();


  const [imageSrc, setImageSrc] = useState(() => {
    if(type == 'LayerWithImage') return content
    else return null
  })

  useEffect(() => {
    if(type == 'LayerWithImage'){
      handleImageUpload()
    }else if(type == 'Aggregate'){
      handleAggregate()
    }else if(type == 'Export'){
      handleExport()
    }else if(type == 'circle'){
      handleCircle()
    }else if(type == 'duplicate'){
      handleDuplicate()
    }else if(type == 'duplicateLasso'){
      handleDuplicateLasso()
    }else if(type == 'lasso'){
      handleLasso()
      activateLasso()
    }
    else{
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d');
      ctx.canvas.width = canvas.clientWidth;
      ctx.canvas.height = canvas.clientHeight;
    }

  }, [])

  useEffect(() => {
    const currentId = Number(layerRef.current.dataset.id)
    const bool = currentItems.includes(currentId)
    if(action.dispatch == 'stamp') handleStamp()
  }, [action])

  function handleMouseDown(e){
    handleMouseDownDrag(e)

    handleMouseDownCrop(e)
    handleMouseDownPencil(e)
    if(type == 'lasso'){
      handleMouseDownLasso(e)
    }
    handleMouseDownShape(e)
    handleMouseDownPaintBucket(e)
    handleMouseDownMask(e)

  }

  function handleImageUpload(){
    layerRef.current.style.height = 'auto'
    drawImage()
  }
 
  async function handleExport(){
    createAggregateLayer()
    await drawAllImagesAsync()
      const canvas = canvasRef.current
      const downloadUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'canvas_image.png';
      setAction({
        dispatch : 'deleteLayer',
        params : `${layerRef.current.dataset.id}`
      })
      link.click();
  }
  function drawImageAsync(x) {
    return new Promise((resolve) => {
      const newParent = layerRef.current
      const aggregateMatrixNewParent = findAggregateMatrix(newParent)
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const w = context.canvas.width / 2;
      const z = context.canvas.height / 2;
      const child = document.querySelector(`[data-id="${x}"].layer`)
      const aggregateMatrixChild = findAggregateMatrix(child)
      const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)
  
      const canvasChild = child.querySelector('.layer-canvas')
      const canvasChildImage = canvasChild.toDataURL('image/png');
  
      const canvasChildWidth = canvasChild.clientWidth
      const canvasChildHeight = canvasChild.clientHeight
  
      const image = new Image();
      image.src = canvasChildImage
  
      image.onload = () => {
        const [a,b,c,d,e,f] = transformMatrix
        const e1 = -c*z + e + w*(1-a)
        const f1 = -b*w + f + z*(1-d)
        const transformMatrixNew = [a,b,c,d,e1,f1]
        const w1 = w - (canvasChildWidth/2)
        const z1 = z - (canvasChildHeight/2)
        context.setTransform(...transformMatrixNew);
        context.drawImage(image, w1,z1, canvasChildWidth, canvasChildHeight);
        context.setTransform(1, 0, 0, 1, 0, 0);
        resolve()
      };
    });
  }
  async function drawAllImagesAsync() {
    const promises = [];
    const array = [...currentItems]

    for (const item of array) {
      promises.push(drawImageAsync(item));
    }
    await Promise.all(promises);
  }


  function handleCircle(){

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');
    canvas.style.width = `25vw`
    canvas.style.height = `25vw`
    ctx.canvas.width = canvas.clientWidth;
    ctx.canvas.height = canvas.clientHeight;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width/2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    const opacityInput = document.querySelector('.pencil-actionbar-opacity-value-input')
    const opacity = opacityInput.value
    const colorPallete2 = document.querySelector('.photoshop-body-toolbar-color-input')
    const color2 = colorPallete2.value
    const rgba = getRGBAOpacity(color2, opacity/100)
    ctx.fillStyle = rgba;
    ctx.fill();
    setCurrentItems([Number(layerRef.current.dataset.id)])
  }
  function handleDuplicate(){
    const originalLayer = document.querySelector(`[data-id="${content}"].layer`)
    const transform = getTransform(originalLayer)
    const writenMatrix = writeMatrix(transform)
    layerRef.current.style.transform = writenMatrix

    const originalLayerCanvas = originalLayer.querySelector('.layer-canvas')
    const originalLayerContext = originalLayerCanvas.getContext('2d');
    const newLayerCanvas = canvasRef.current
    const newLayerContext = newLayerCanvas.getContext('2d');

    newLayerCanvas.style.width = originalLayerCanvas.style.width
    newLayerCanvas.style.height = originalLayerCanvas.style.height
    newLayerContext.canvas.width = originalLayerContext.canvas.width
    newLayerContext.canvas.height = originalLayerContext.canvas.height

    const originalLayerCanvasImage = originalLayerCanvas.toDataURL('image/png');
    const image = new Image();
    image.src = originalLayerCanvasImage
    image.onload = () => {
      newLayerContext.drawImage(image, 0,0, originalLayerContext.canvas.width, originalLayerContext.canvas.height);
    };
    setCurrentItems([Number(layerRef.current.dataset.id)])
    setTool('drag')
  }
  function handleDuplicateLasso(){
    const childLayer = document.querySelector(`[data-id="${content.child}"].layer`)
    const transform = getTransform(childLayer)
    const writenMatrix = writeMatrix(transform)
    layerRef.current.style.transform = writenMatrix

    const childLayerCanvas = childLayer.querySelector('.layer-canvas')
    const childLayerContext = childLayerCanvas.getContext('2d');
    
    const newLayerCanvas = canvasRef.current
    const newLayerContext = newLayerCanvas.getContext('2d');

    newLayerCanvas.style.width = childLayerCanvas.style.width
    newLayerCanvas.style.height = childLayerCanvas.style.height
    newLayerContext.canvas.width = childLayerContext.canvas.width
    newLayerContext.canvas.height = childLayerContext.canvas.height
    console.log(content.parent)
    handlePrintCanvas(content.parent, id)

    setCurrentItems([Number(layerRef.current.dataset.id)])
    setTool('drag')
  }



  function handleAggregate(){
    createAggregateLayer()
    drawAllImages()
  }
  function createAggregateLayer(){
    const canvasContainer = document.querySelector('.canvas-container')
    const boundingBox = canvasContainer.getBoundingClientRect()
    const centerX = (boundingBox.right + boundingBox.left)/2
    const centerY = (boundingBox.bottom + boundingBox.top )/2

    const width = 2*Math.max(content.right - centerX, centerX - content.left) + 10
    const height = 2*Math.max(content.top - centerY, centerY - content.bottom) + 10
    const widthResponsive = 100*width/window.innerWidth
    const aspectRatio = height/width

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');

    canvas.style.width = `${widthResponsive}vw`
    canvas.style.height = `${widthResponsive*aspectRatio}vw`

    ctx.canvas.width = canvas.clientWidth;
    ctx.canvas.height = canvas.clientHeight;
  }
  async function drawAllImages(){
    const promises = [];
    const array = [...currentItems]

    for (const item of array) {
      promises.push(drawImageAggregate(item));
    }
    await Promise.all(promises);

        setAction({ 
            dispatch : 'deleteLayersAggregate',
            params : [Number(layerRef.current.dataset.id)]
        })
        setTool('drag')
  }
  function drawImageAggregate(x){
    return new Promise((resolve) => {

    const newParent = layerRef.current
    const aggregateMatrixNewParent = findAggregateMatrix(newParent)
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.globalCompositeOperation = 'source-over';
    const w = context.canvas.width / 2;
    const z = context.canvas.height / 2;
    const child = document.querySelector(`[data-id="${x}"].layer`)
    const aggregateMatrixChild = findAggregateMatrix(child)
    const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)

    const canvasChild = child.querySelector('.layer-canvas')
    const canvasChildImage = canvasChild.toDataURL('image/png');

    const canvasChildWidth = canvasChild.clientWidth
    const canvasChildHeight = canvasChild.clientHeight

    const image = new Image();
    image.src = canvasChildImage
  
    image.onload = () => {
      const [a,b,c,d,e,f] = transformMatrix
      const e1 = -c*z + e + w*(1-a)
      const f1 = -b*w + f + z*(1-d)
      const transformMatrixNew = [a,b,c,d,e1,f1]
      const w1 = w - (canvasChildWidth/2)
      const z1 = z - (canvasChildHeight/2)
      context.setTransform(...transformMatrixNew);
      context.drawImage(image, w1,z1, canvasChildWidth, canvasChildHeight);
      context.setTransform(1, 0, 0, 1, 0, 0);
      resolve()
    };
  });

  }

 





  function drawImage(){
    const croppedImage = new Image();
    croppedImage.src = imageSrc
    croppedImage.onload = () => {
      const aspectRatio = croppedImage.height/croppedImage.width

      const canvas = canvasRef.current
      const context = canvas.getContext('2d');
      
      canvas.style.width = '50vw'
      canvas.style.height = `${50*aspectRatio}vw`
      context.canvas.width = canvas.clientWidth;
      context.canvas.height = canvas.clientHeight;
      context.clearRect(0, 0,canvas.clientWidth, canvas.clientHeight);
      context.drawImage(croppedImage, 0,0,canvas.clientWidth, canvas.clientHeight);
      // context.canvas.width = croppedImage.width;
      // context.canvas.height = croppedImage.height;
      // context.clearRect(0, 0,canvas.clientWidth, canvas.clientHeight);
      // context.drawImage(croppedImage, 0,0,croppedImage.width, croppedImage.height);
    };
    
  }

 

 
  function handleMouseDownPaintBucket(e){
    const currentId = Number(layerRef.current.dataset.id)
    const bool = currentItems.includes(currentId)
    if(tool !== 'paintBucket' || !bool) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');
    const opacityInput = document.querySelector('.pencil-actionbar-opacity-value-input')
    const opacity = opacityInput.value
    const colorPallete2 = document.querySelector('.photoshop-body-toolbar-color-input')
    const color2 = colorPallete2.value
    const rgba = getRGBAOpacity(color2, opacity/100)
    ctx.fillStyle = rgba;
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
  }

  function handleStamp(){
    const currentId = Number(layerRef.current.dataset.id)
    const bool = currentItems.includes(currentId)
    const bool2 = layerRef.current.classList.contains('stamp')
    if(!bool || bool2) return
    const stampItem = document.querySelector('.workspace-layer.stamp')
    if(stampItem){
      const stampId = stampItem.dataset.id
      handlePrintCanvas(stampId, currentId)
    }
  }
  function handleLasso(){
    const canvasContainer = document.querySelector('.canvas-container')
    const canvasContainerWidth = Number(getComputedStyle(canvasContainer).width.slice(0,-2))
    const canvasContainerHeight = Number(getComputedStyle(canvasContainer).height.slice(0,-2))
    const aspectRatio = canvasContainerHeight/canvasContainerWidth
    const canvas = canvasRef.current
    const context = canvas.getContext('2d');
    canvas.style.width = `${100*canvasContainerWidth/window.innerWidth}vw`
    canvas.style.height = `${100*aspectRatio*canvasContainerWidth/window.innerWidth}vw`
    context.canvas.width = canvas.clientWidth;
    context.canvas.height = canvas.clientHeight;
    layerRef.current.style.zIndex = 100
  }


  return (
    <div
    ref={layerRef}
    onMouseDown={handleMouseDown}
    data-id={id}
    className="layer draggable-item">
          <canvas ref={canvasRef} className="layer-canvas"></canvas>
    </div>
  )
}
