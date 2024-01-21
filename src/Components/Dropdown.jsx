import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { useAction } from '../Context/ActionsContext';

import { useDropdown } from '../Context/DropdownContext'
export default function Dropdown() {

  const {dropDownOptions, setDropDownOptions, dropDownActive, setDropDownActive} = useDropdown()
  const [dropdownStyle, setDropDownStyle] = useState({})
  const [dropdownFunctions, setDropDownFunctions] = useState([])
  const {action, setAction} = useAction()

  useEffect(() => {
    if(dropDownOptions !== null) enableDropdown()
    window.addEventListener('click', closeDropdown);

    return () => {
      window.removeEventListener('click', closeDropdown);
    };
  }, [dropDownOptions])

  function closeDropdown(e){
    setDropDownActive(false)
  }
  function enableDropdown(e){
    setDropDownActive(true)
    const dropdownStyleUpdated = getDropDownStyle()
    setDropDownStyle(dropdownStyleUpdated)
    const dropdownFunctionsUpdated = getDropDownFunction(dropDownOptions.target)
    setDropDownFunctions(dropdownFunctionsUpdated)
  }
  function getDropDownStyle(){
    const dropdownStyleNew = {
      top: `${dropDownOptions.y}px`,
      left: `${dropDownOptions.x}px`,
    };
    return dropdownStyleNew
  }
  function getDropDownFunction(target){
    if(target.closest('.workspace-layer') !== null){
      return [
        // {
        //   name: 'Delete Layer',
        //   dispatch : 'deleteLayer',
        //   params : `${target.closest('.workspace-layer').dataset.id}`
        // },
        {
          name: 'Delete Layers',
          dispatch : 'deleteLayers',
          params : `null`
        },
        {
          name: 'Rename Layer',
          dispatch : 'renameLayer',
          params : `${target.closest('.workspace-layer').dataset.id}`
        },
        {
          name: 'Merge Layers',
          dispatch : 'mergeLayers',
          params : `null`
        },
        {
          name: 'Export Layers',
          dispatch : 'exportLayers',
          params : `null`
        },
        {
          name: 'Copy Layers',
          dispatch : 'copy',
          params : `null`
        },
        {
          name: 'Paste Layers',
          dispatch : 'paste',
          params : `null`
        }
      ]
    }else{
      return [
        {
          name: 'empty',
          dispatch : 'null'
        }
      ]
    }
  }
  function handleDispatch(command, params){
    setAction(
      {
        name : `${command}`,
        dispatch : `${command}`,
        params : params
      }
    )
  }
  return (
    <>
      {dropDownActive &&
        
      <div style={dropdownStyle} className="dropdown-container">
        
        {dropdownFunctions.map((x,i) => {
          return <div key={i} onClick={() => handleDispatch(x.dispatch, x.params)} className="dropdown-option">{x.name}</div>
        })}
      </div>
      }
    </>
  )
}
