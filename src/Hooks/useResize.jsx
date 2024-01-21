import { useEffect, useRef } from 'react'

export default function useResize(itemRef){

  const offset = useRef(0);
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const div = createDiv()
    itemRef.current.append(div)
  }, [])

  function createDiv(){
    const div = document.createElement('div')
    div.classList += 'right-corner'
    return div
  }


  function startDrag(e){
    offset.current = {
      x: e.clientX,
      y: e.clientY,
    }
    window.addEventListener('mouseup', handleMouseUp, { once : true})
    window.addEventListener('mousemove', handleDrag);
  }

  function handleDrag(e){
    e.preventDefault()
    const offsetX = e.clientX - offset.current.x;
    const offsetY = e.clientY - offset.current.y;
    const result = {
        x: position.current.x + offsetX,
        y: position.current.y + offsetY,
    }
    itemRef.current.style.transform = `translate(${result.x}px, ${result.y}px)`
    position.current = result;  
    offset.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  function handleMouseUp(e){
    window.removeEventListener('mousemove', handleDrag);
  };


    return [position, startDrag]
}