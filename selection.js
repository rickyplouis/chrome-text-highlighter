document.addEventListener('mouseup', (event) => {
  let selection = returnSelectedText().toString()
  console.log('selection', selection);
});

function returnSelectedText(){
  return window.getSelection();
}
