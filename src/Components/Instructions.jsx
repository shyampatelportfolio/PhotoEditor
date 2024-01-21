import React from 'react'
import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { useAction } from '../Context/ActionsContext';
import InstructionCommands from '../Json/Instructions.json'

export default function Instructions() {
    const [instructionItems, setInstructionItems] = useState([])
    const [display, setDisplay] = useState(false)
    const {action, setAction} = useAction()
    useEffect(() => {
        if(action.dispatch == 'instructions'){
          changeInstructionItems()
        }
      }, [action])
  
    function changeInstructionItems(){
        const items = InstructionCommands.instructions.filter(x => {
            return x.name == action.params
            }
        )
        setInstructionItems(items[0].commands)
        setDisplay(true)

    }
  return (
    <>
        {display &&
            <>
                <div className="instructions-container">
                    <div onClick={() =>  setDisplay(false)} className="instructions-close">
                        <img src="/Svg/Close.svg" alt="" />
                    </div>
                    <div className="instructions-title">Instructions</div>
                    {instructionItems.map((x,i) => {
                        return <div key={i} className='instructions-item'>{x}</div>
                    })}
                </div>
            </>
        }    
    </>
            
  )
}
