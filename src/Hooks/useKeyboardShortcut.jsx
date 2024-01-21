import { useRef, useState, useEffect, useContext, useCallback } from 'react'


export default function useKeyboardShortcut(){

  const [keyboardAction, setKeyboardAction] = useState({
    dispatch : ''
  })
  const [keyboardParams, setKeyboardParams] = useState([])


    useEffect(() => {
        window.addEventListener('keydown', handleKeyboard);
        return () => {
          window.removeEventListener('keydown', handleKeyboard);
        };
    }, [])

    function handleKeyboard(e){
      if(e.key == 'Delete'){
        setKeyboardAction({
          dispatch : 'delete'
        })
      }
      if (e.ctrlKey && e.key === 'c') {
        setKeyboardAction({
          dispatch : 'copy'
        })
      }
      if (e.ctrlKey && e.key === 'v') {
        setKeyboardAction({
          dispatch : 'paste'
        })
      }
    }




    return [keyboardAction, keyboardParams, setKeyboardParams]
}