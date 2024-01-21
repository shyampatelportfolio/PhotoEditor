import { useRef, useState, useEffect, useContext, useCallback } from 'react'

import { useTool } from '../Context/ToolContext';
import { useDropdown } from '../Context/DropdownContext'
import { useAction } from '../Context/ActionsContext';

export default function WorkspaceLayer({name, id, checkLayerOrder}) {


  const { tool, setTool, currentItems, setCurrentItems } = useTool();
  const {dropDownOptions, setDropDownOptions, dropDownActive, setDropDownActive} = useDropdown()
  const {action, setAction} = useAction()
  const [isRenaming, setIsRenaming] = useState(false)
  const [workspaceName, setWorkspaceName] = useState(name)
  const inputRef = useRef()
  const WorkspaceLayerRef = useRef()


  useEffect(() => {
    if(action.dispatch == 'setStamp') handleSetStamp()
    if(action.dispatch == 'clearStamp') clearStamp()
    if(action.dispatch == 'renameLayer' && action.params == id) handleRenameLayer(action.params)
  }, [action])
  useEffect(() => {
    handleWorkspaceClassNames()
  }, [currentItems])
  useEffect(() => {
    if(tool !== 'stamp') clearStamp()
  }, [tool])


    function handleWorkspaceClassNames(){
        const workspaceLayers = [...document.querySelectorAll('.workspace-layer')]
        if(action.dispatch == 'setStampClick'){
            const workspaceLayer = workspaceLayers.filter(x => Number(x.dataset.id) == currentItems[0])
            workspaceLayers.forEach(x => x.classList.remove('stamp'))
            workspaceLayer.forEach(x => x.classList.add('stamp'))
            setAction({
                dispatch : '',
            })
        }
        workspaceLayers.forEach((x) => {
            const workspaceLayerId = Number(x.dataset.id)
            if(currentItems.includes(workspaceLayerId)){
                x.classList.remove('selected')
                x.classList.add('selected')
                
            }else{
                x.classList.remove('selected')
            }
        }
        )
    }
    function addToCurrentItemsSorted(item){
        if(!currentItems.includes(item)){
            const updatedNumbers = [...currentItems, item]
            updatedNumbers.sort((a, b) => a - b)
            setCurrentItems(updatedNumbers);
        }else{
            const updatedNumbers = currentItems.filter(x => {
                return x !== item
            })
            setCurrentItems(updatedNumbers);
        }
    }
    function handleClickLayer(e){
        if(e.target.closest('.workspace-layer-visibility') !== null){
            return
        }
        const container = e.target.closest('.workspace-layer')
        const containerId = Number(container.dataset.id)

        if(e.ctrlKey || e.shiftKey){
            addToCurrentItemsSorted(containerId)
        }
        else{
            
            const bool = currentItems.includes(containerId)
            if(currentItems.length > 1){
                setCurrentItems([containerId])
            }
            else if(currentItems.length == 1 && bool){
            }
            else{
                setCurrentItems([containerId])
            }
        }
        if(action.dispatch == 'setStampWaiting'){
            setAction({
                dispatch : 'setStampClick',
            })
        }
    }
  

    function handleSetStamp(){
        setCurrentItems([])
        setAction({
            dispatch : 'setStampWaiting',
        })
    }
    function clearStamp(){
        const workspaceLayers = [...document.querySelectorAll('.workspace-layer')]
        workspaceLayers.forEach(x => x.classList.remove('stamp'))

    }

    function handleVisibility(e){
        const container = e.target.closest('.workspace-layer')
        const containerId = Number(container.dataset.id)
        const layer = document.querySelector(`[data-id="${containerId}"].layer`)
        layer.classList.toggle('hide')
        e.target.closest('.workspace-layer-visibility').classList.toggle('off')
        
    }



    
    function handleDragStart(e){
        e.target.classList.add('dragging')
    }
    function handleDragEnd(e){
        e.target.classList.remove('dragging')
    }
    function handleDragOver(e){
        e.preventDefault()
        const afterElement = getDragAfterElement(e.clientY)
        const draggable = document.querySelector('.dragging')
        const container = document.querySelector('.workspace-layers')
        if (afterElement == null) {
            container.appendChild(draggable)
            checkLayerOrder()
          } else {
            container.insertBefore(draggable, afterElement)
            checkLayerOrder()

          }
    }

    function getDragAfterElement(y){
        const draggableElements = [...document.querySelectorAll('.workspace-layer:not(.dragging)')]
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child }
            } else {
              return closest
            }
          }, { offset: Number.NEGATIVE_INFINITY }).element
        
    }

    function handleRightClick(e){
        e.preventDefault();
        setDropDownOptions({
          target :  e.target,
          x : e.clientX,
          y : e.clientY
      })
    }

    function handleRenameLayer(){
        setIsRenaming(true)
        window.addEventListener('keydown', handleEnterKeyPressRenaming);
    }
    function handleNameInput(e){
        setWorkspaceName(e.target.value)
    }
    function handleEnterKeyPressRenaming(e){
        if (e.key !== 'Enter') return
        setIsRenaming(false)
        setAction(
            {
                name : 'renameLayerUpdate',
                dispatch : 'renameLayerUpdate',
                params : id,
                content : `${inputRef.current.value}`
              }
        )
        window.removeEventListener('keydown', handleEnterKeyPressRenaming)
    }
  return (
    <>  
        <div ref={WorkspaceLayerRef} onContextMenu={handleRightClick} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} draggable='true' onClick={handleClickLayer} data-id={id} className="workspace-layer">
            <div onClick={handleVisibility} className="workspace-layer-visibility">
                <img src="/Svg/EyeFull.svg" alt="" />
            </div>
            <div className="workspace-layer-icon"></div>
            <div className="workspace-layer-name">
                {!isRenaming && 
                workspaceName
                }
                {isRenaming && 
                <input ref={inputRef} onChange={handleNameInput} type="text" className='workspace-layer-name-input'/>
                }
            </div>
        </div>

        
    </>
  )
}
