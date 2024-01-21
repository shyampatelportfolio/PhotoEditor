function handleDownload(){
    const canvas = canvasRef.current
    html2canvas(canvas).then((myCanvas) => {
      const canvasImage = myCanvas.toDataURL('image/jpeg');
      const a = document.createElement('a');
      a.href = canvasImage;
      a.download = 'editedImage.jpg';
      a.click();
    });
  }
function testCoordinates(e){
    // console.log(e.clientX + window.scrollX, e.clientY + window.scrollY)

}

function handleToolChange(e){
  console.log(tool)
  if( tool == 'drag') toggleDrag()
  setTool(e)
  if( e == 'drag') toggleDrag()
  clearLasso()
  clearPencil()
}