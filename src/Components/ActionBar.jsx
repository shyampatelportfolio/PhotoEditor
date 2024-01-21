import React from 'react'
import { useTool } from '../Context/ToolContext';
import { useAction } from '../Context/ActionsContext';
import { useRef, useEffect, useState } from 'react'
import PaintActionBar from './PaintActionBar';
import useDragStatic from '../Hooks/UseDragStatic';

export default function ActionBar() {

  const actionBarRef = useRef()
  const { tool, setTool, currentItems, setCurrentItems } = useTool();
  const {action, setAction} = useAction()
  const [options, setOptions] = useState([])
  const [isShapes, setIsShapes] = useState(false)
  const [handleMouseDownDrag, cancelDrag, enableDrag] = useDragStatic(actionBarRef)

  useEffect(() => {
    if(tool == 'crop'){

      setOptions(
          [
              {
                  name : 'Crop',
                  action : 'crop'
              },
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Crop'
              }
          ]
      )
    }
    if(tool == 'drag'){
      setOptions(
        [
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Drag'
              }
        ]
      )
    }
    if(tool == 'circle'){
      setOptions(
        [
              {
                name : 'Draw Circle',
                action : 'circle'
              },
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Circle'
              }
        ]
      )
    }
    if(tool == 'stamp'){
      setOptions(
        [
              {
                name : 'Stamp',
                action : 'stamp'
              },
              {
                name : 'Set Stamp',
                action : 'setStamp'
              }, 
              {
                name : 'Clear Stamp',
                action : 'clearStamp'
              },
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Stamp'
              }
        ]
      )
    }
    if(tool == 'lasso'){
      setOptions(
        [
              {
                name : 'Create New layer',
                action : 'lassoLayer'
              },
              {
                name : 'Erase From Layer',
                action : 'lassoErase'
              }, 
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Lasso'
              }
        ]
      )
    }
    if(tool == 'shape'){
      setOptions(
        [
              {
                name : 'Close Path',
                action : 'closePath'
              },
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Shape'
              }
        ]
      )
    }
    if(tool == 'mask'){
      setOptions(
        [
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Mask'
              },
        ]
      )
    }
    if(tool == 'paintBucket'){
      setOptions(
        [
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'PaintBucket'
              },
        ]
      )
    }
    if(tool == 'pencil'){
      setOptions(
        [
              {
                name : 'Instructions',
                action : 'instructions',
                params : 'Pencil'
              }
        ]
      )
    }
  }, [tool])
  useEffect(() => {

  }, [action])

  function handleAction(e){
    let params = ''
    if(e.target.dataset.params) params = e.target.dataset.params
    setAction({ 
        dispatch : e.target.dataset.action,
        params : params
    })
  }
  return (
    <>
    <div ref={actionBarRef} className="canvas-action-bar">
      <div onMouseDown={handleMouseDownDrag}  className="canvas-action-bar-dragger">
        <img src="/Svg/ActionBarDrag.svg" alt="" draggable={false} />
      </div>
        {
          (tool == 'drag' || tool == 'crop' || tool == 'stamp' || tool == 'lasso') &&
          
          <>
              {options.map((x,i) => {
                  return (
                      <div key={i} data-params={x.params} onClick={handleAction} data-action={x.action} className="canvas-action-bar-option">{x.name}</div>
                  )
              })}
    
          </>
        }
        {
          (tool == 'circle' || tool == 'shape'  || tool == 'mask' || tool == 'pencil' || tool == 'paintBucket') &&
          <>
          <PaintActionBar></PaintActionBar>
              {options.map((x,i) => {
                  return (
                      <div key={i} data-params={x.params} onClick={handleAction} data-action={x.action} className="canvas-action-bar-option">{x.name}</div>
                  )
              })}
          </>

        }
    
    </div>
    
    </>

  )
}
