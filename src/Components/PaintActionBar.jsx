import React from 'react'
import { useTool } from '../Context/ToolContext';
import PaintPallette from './PaintComponents/PaintPallette';
import PaintOpacity from './PaintComponents/PaintOpacity';
import PaintStrokeWidth from './PaintComponents/PaintStrokeWidth';


export default function PaintActionBar() {

  const { tool, setTool, currentItems, setCurrentItems } = useTool();

 


  return (
    <div className="paint-actionbar">
          <PaintPallette></PaintPallette>
          <PaintOpacity></PaintOpacity>
          
          {
           tool !== 'paintBucket' &&
           <PaintStrokeWidth></PaintStrokeWidth>


          }
    </div>
  )
}
