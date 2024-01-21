import React from 'react'
import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { useTool } from '../Context/ToolContext';
import { useAction } from '../Context/ActionsContext';

export default function ToolBar() {

  const { tool, setTool, currentItems, setCurrentItems } = useTool();
  const {action, setAction} = useAction()

  function handleToolbar(e){
    const container  = e.target.closest('.photoshop-body-toolbar-tool')
    let tool = container.dataset.tool
    setTool(tool)
  }


  
  return (
    <div className="photoshop-body-toolbar">
          <div onClick={handleToolbar} className="photoshop-body-toolbar-tools">

            <div data-tool='drag' className="photoshop-body-toolbar-tool">
              <img src="/Svg/DragTool.svg" alt="" />
            </div>
            <div data-tool='pencil' className="photoshop-body-toolbar-tool">
            <img src="/Svg/PenTool.svg" alt="" />

            </div>
            <div data-tool='lasso' className="photoshop-body-toolbar-tool lasso">
            <img src="/Svg/LassoTool.svg" alt="" />
            </div>
            <div data-tool='crop' className="photoshop-body-toolbar-tool">
            <img src="/Svg/CropTool.svg" alt="" />
            </div>
            <div data-tool='paintBucket' className="photoshop-body-toolbar-tool">
            <img src="/Images/PaintBucket.png" alt="" />
            </div>
            <div data-tool='mask' className="photoshop-body-toolbar-tool">
            <img src="/Svg/Mask.svg" alt="" />
            </div>
            <div data-tool='circle' className="photoshop-body-toolbar-tool">
            <img src="/Svg/Circle.svg" alt="" />
            </div>
            <div data-tool='stamp' className="photoshop-body-toolbar-tool">
            <img src="/Svg/Stamp.svg" alt="" />
            </div>
            <div data-tool='shape' className="photoshop-body-toolbar-tool">
            <img src="/Svg/Polygon.svg" alt="" />
            </div>
          </div>

    </div>
  )
}
