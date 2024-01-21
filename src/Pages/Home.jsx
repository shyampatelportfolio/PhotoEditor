import React from 'react'
import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import Layer from '../Components/Layer';
import {writeMatrix, findAggregateMatrix, InverseComposeMatrixArray } from '../Functions/Functions';
import { useTool } from '../Context/ToolContext';
import WorkspaceLayer from '../Components/WorkspaceLayer';
import ActionBar from '../Components/ActionBar';
import useKeyboardShortcut from '../Hooks/useKeyboardShortcut';
import Dropdown from '../Components/Dropdown';
import { useAction } from '../Context/ActionsContext';
import ToolBar from '../Components/ToolBar';
import Header from '../Components/Header';
import Instructions from '../Components/Instructions';

export default function Home() {

  const { tool, setTool, currentItems, setCurrentItems } = useTool();

  const [layers, setLayers] = useState([]);
  const [keyboardAction, keyboardParams, setKeyboardParams] = useKeyboardShortcut()
  const {action, setAction} = useAction()



  useEffect(() => {
    if(keyboardAction.dispatch == 'delete'){
      handleDeleteLayerSelected()
    }
    if(keyboardAction.dispatch == 'copy'){
      handleCopyLayer()
    }
    if(keyboardAction.dispatch == 'paste'){
      handlePasteLayer()
    }
  }, [keyboardAction])

  useEffect(() => {
    if(action.dispatch == 'test2'){
      handleTest()
    }
    if(action.dispatch == 'test3'){
      handleMerge()
    }
    if(action.dispatch == 'copy'){
      handleCopyLayer()
    }
    if(action.dispatch == 'paste'){
      handlePasteLayer()
    }
    if(action.dispatch == 'lassoLayerDuplicate'){
      handleLassoCreate()
    }
    if(action.dispatch == 'circle') handleShapeCircle()
    if(action.dispatch == 'deleteLayers') handleDeleteLayerSelected()
    if(action.dispatch == 'deleteLayersAggregate') handleDeleteLayerSelected()

    if(action.dispatch == 'exportLayers') handleExport()
    if(action.dispatch == 'mergeLayers') handleMerge(false)
    if(action.dispatch == 'deleteLayer') handleDeleteLayerSelectedParams(action.params)
    if(action.dispatch == 'renameLayerUpdate') handleRenameLayer(action.params ,action.content)
  }, [action])
  useEffect(() => {
    if(tool == 'lasso'){
      createLasso()
    }
  }, [tool])


  function handleImageUpload(e){
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      handleAddLayer({
        contentType : 'LayerWithImage',
        display : true,
        // contentType : 'Image',

        content : reader.result
      })
    };

    reader.readAsDataURL(file);
  }
 
  function handleDrop(e){
    return
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const dataURL = URL.createObjectURL(imageFiles[0])
    console.log(dataURL)
    setDroppedImages(prev => [...prev, dataURL])
  }
  function handleDragOver(e){
    e.preventDefault()
  }


  function handleAddImage(e){
    const input = e.target.closest('.workspace-tools-item').querySelector('.image-upload')
    if(input) input.click()
  }
  function handleAddLayer(info){
    const newId = generateId()
    let layer = {
      id : newId,
      contentType : 'Layer',
      content : '',
      name : '',
      display : true
    }
    if(info){
      layer.contentType = info.contentType
      layer.content = info.content
      layer.display = info.display
    }
    layer.name = `Layer${newId}`
    setLayers(prev => [...prev, layer])
  }
  function handleAddLayerMultiple(info){
    let newId = generateId()
    let layersArray = []
    info.forEach(x => {

      let layer = {
        id : newId,
        contentType : x.contentType,
        content : x.content,
        name : '',
        display : x.display
      }
      layer.name = `Layer${newId}`
      newId ++
      layersArray.push(layer)

    })
    setLayers(prev => [...prev, ...layersArray])
  }
  function handleDeleteLayerSelected(){
    if(currentItems.length !== 0){
      const updatedLayers = layers.filter(layer => !currentItems.includes(layer.id));
      setLayers(updatedLayers);
      if(action.dispatch == 'deleteLayersAggregate'){
        setAction({
          dispatch : null
        })
        setCurrentItems(action.params)
      }else{
        if(updatedLayers[0]){
          const firstLayer = updatedLayers[0].id
          setCurrentItems([firstLayer])
        }else{
          setCurrentItems([])
        }
      }
    }
  }
  function handleDeleteLayerSelectedParams(id){
      const numberId = Number(id)
      const updatedLayers = layers.filter(layer => layer.id !== numberId);
      setLayers(updatedLayers);

  }
  function handleRenameLayer(id, name){
    let updatedLayers = layers.map((x,i) => {
      if(x.id == id){
        let updatedLayer = x
        updatedLayer.name = name
        return updatedLayer
      }else{
        return x
      }
    })
    setLayers(updatedLayers)
  }

  function checkLayerOrder(){
    const workspaceLayers = [...document.querySelectorAll('.workspace-layer')]
    const indexArray = workspaceLayers.map(x => {
      return x.dataset.id
    })
    
    const rearrangedArray = indexArray.map((id) =>
      layers.find((obj) => obj.id == id)
    );
    setLayers(rearrangedArray)

  }
 


  function generateId(){
    const draggableItems = [...document.querySelectorAll('.under-transform')]
    const IdArrayTemp = draggableItems.map((x,i) => {
      if(x.dataset.id){

        return Number(x.dataset.id)
      }else{
        return -1
      }
    })
  
    let largestItem = 0
    if(IdArrayTemp.length !== 0){
      largestItem = Math.max(...IdArrayTemp);
    }
    return largestItem + 1
  }


  
  function handleGroup(){

    const child = document.querySelector(`[data-id="${4}"].layer`)
    const newParent = document.querySelector(`[data-id="${3}"].layer`)
    const parent = child.parentNode
    const aggregateMatrixChild = findAggregateMatrix(child)
    const aggregateMatrixNewParent = findAggregateMatrix(newParent)
    const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)
    parent.removeChild(child)
    newParent.appendChild(child)
    
    child.style.transform = writeMatrix(transformMatrix)
  }
  function handleTest(){
    
    const child = document.querySelector(`[data-id="${2}"].layer`)
    const newParent = document.querySelector(`[data-id="${1}"].layer`)
    const aggregateMatrixChild = findAggregateMatrix(child)
    const aggregateMatrixNewParent = findAggregateMatrix(newParent)
    const transformMatrix = InverseComposeMatrixArray(aggregateMatrixChild, aggregateMatrixNewParent)
  
    const canvas = newParent.querySelector('.layer-canvas');
    const context = canvas.getContext('2d');

    const canvasChild = child.querySelector('.layer-canvas')
    const canvasChildContext = canvasChild.getContext('2d');

    const canvasChildImage = canvasChild.toDataURL('image/png');

    const canvasChildWidth = canvasChild.clientWidth
    const canvasChildHeight = canvasChild.clientHeight
    // const canvasChildWidth = canvasChildContext.canvas.width
    // const canvasChildHeight = canvasChildContext.canvas.height


    const image = new Image();
    image.src = canvasChildImage

    image.onload = () => {
      const height = Number(getComputedStyle(canvas).height.slice(0,-2))
      const width = Number(getComputedStyle(canvas).width.slice(0,-2))
      const scaleFactorX = context.canvas.width/width
      const scaleFactorY = context.canvas.height/height

      const w = context.canvas.width / 2;
      const z = context.canvas.height / 2;
      const [a,b,c,d,e,f] = transformMatrix
      const e1 = -c*z + e*scaleFactorX + w*(1-a)
      const f1 = -b*w + f*scaleFactorX  + z*(1-d)
      const transformMatrixNew = [a,b,c,d,e1,f1]
      const w1 = w - (canvasChildWidth*scaleFactorX/2)
      const z1 = z - (canvasChildHeight*scaleFactorY/2)
      context.setTransform(...transformMatrixNew);
      context.drawImage(image, w1,z1, canvasChildWidth*scaleFactorX, canvasChildHeight*scaleFactorY);

      context.setTransform(1, 0, 0, 1, 0, 0);

    };
    
  }
  function handleUnGroup(){
    const childNumber = document.querySelector('.child-number').value
    const child = document.querySelector(`[data-id="${childNumber}"]`)
    const parent = child.parentNode
    const aggregateMatrixChild = findAggregateMatrix(child)
    parent.removeChild(child)
    const canvasContainer = document.querySelector('.canvas-container')
    canvasContainer.appendChild(child)

    child.style.transform = writeMatrix(aggregateMatrixChild)

  }
  function handleMerge(isExport){
    let top 
    let bottom
    let right
    let left
    const contentType = isExport? 'Export' : 'Aggregate'
    if(currentItems.length == 0) return
    if(currentItems.length == 1 && contentType == 'Aggregate') return
    console.log(currentItems)
    currentItems.forEach((x, i) => {
      const layer = document.querySelector(`[data-id="${x}"].layer`)
      const boundingBox = layer.getBoundingClientRect()

      if( i == 0){
        left = boundingBox.left
        right = boundingBox.right
        bottom = boundingBox.top
        top = boundingBox.bottom
      }else{
        if(boundingBox.left < left) left = boundingBox.left
        if(boundingBox.left < right) right = boundingBox.right
        if(boundingBox.top < bottom) bottom = boundingBox.top
        if(boundingBox.top < top) top = boundingBox.bottom
      }
    })
    handleAddLayer({
      contentType : `${contentType}`,
      content : {
        left : left,
        right : right,
        top : top, 
        bottom : bottom
      },
      display : true
    })
  }
  function handleExport(){
    console.log(2222)
    handleMerge(true)
  }


  function handleShapeCircle(){
    handleAddLayer({
      contentType : 'circle',
      display : true
    })
  }

  
  function handleCopyLayer(){
    const selectedLayers = layers.filter(layer => currentItems.includes(layer.id));
    if( selectedLayers.length !== 0 ){
      const selectedLayersId = selectedLayers.map(x => x.id)
      const updatedKeyboardParams = keyboardParams.filter(x => {
        return x.dispatch !== 'copy'
      })
      const newKeyboardParams = [...updatedKeyboardParams, {
        dispatch : 'copy',
        params : selectedLayersId
      }]
      setKeyboardParams(newKeyboardParams)
    }
  }
  function handlePasteLayer(){
    const keyboardParamsCopy = keyboardParams.filter(x => {
      return x.dispatch == 'copy'
    })
    keyboardParamsCopy.forEach(x => {
      const info = x.params.map(y => {
        return {
          contentType : 'duplicate',
          content : y,
          display : true
        }
      })
      handleAddLayerMultiple(info)
    })
  }

  function createLasso(){
    const selectedLayers = layers.filter(layer => layer.contentType == 'lasso');
    if(selectedLayers.length > 0) return
    handleAddLayer({
      contentType : 'lasso',
      display : false
    })
  }
  function handleLassoCreate(){
    handleAddLayerMultiple(
      [{
        contentType : 'duplicateLasso',
        content : action.params,
        display : true
      }]
    )
    // handleDeleteLayerSelectedParams(action.params)
  }

  function handleQuestion(){
    setAction({
      dispatch : 'instructions',
      params : 'WorkSpace'
    })
  }




  return (
    <>
      <Dropdown></Dropdown>
      <Header></Header>
      <div className="photoshop-body">
        <ToolBar></ToolBar>
        <div className="photoshop-body-canvas">
          <Instructions></Instructions>

          <div className="canvas-container" onDrop={handleDrop} onDragOver={handleDragOver}>
              {layers.map(layer => {
                return <Layer key={layer.id} id={layer.id} type={layer.contentType} content={layer.content}/>
              })}
          </div>
          <ActionBar></ActionBar>
        </div>
        <div className="photoshop-body-workspace">
          <div className="workspace-layers">
            {layers.map(layer => {
              if(layer.display){
                return <WorkspaceLayer checkLayerOrder={checkLayerOrder} key={layer.id} name={layer.name} id={layer.id}></WorkspaceLayer>  
              }
            })}
          </div>
          <div className="workspace-tools">
            <div onClick={() => handleAddLayer()} data-tool='add-layer' className="workspace-tools-item">
              <img src="/Svg/Add.svg" alt="" />
            </div>
            <div onClick={handleAddImage} data-tool='add-image' className="workspace-tools-item">
              <img src="/Svg/Gallery.svg" alt="" />
              <input className='hide image-upload' type="file" onChange={handleImageUpload} />
            </div>
            <div onClick={handleQuestion} data-tool='add-image' className="workspace-tools-item question">
              <img src="/Svg/Question.svg" alt="" />
              <input className='hide image-upload' type="file" onChange={handleImageUpload} />
            </div>
          </div>
        </div>
 
      </div>

    </>
  )
}
