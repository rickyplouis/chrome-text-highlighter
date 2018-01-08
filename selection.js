document.addEventListener('mouseup', (event) => {
  var selection = returnSelectedText().toString()
  highlightSelection()
  console.log('returnSelectedText', returnSelectedText());
});

function returnSelectedText(){
  return window.getSelection();
}

//highlight copied from https://stackoverflow.com/questions/304837/javascript-user-selection-highlighting
//refactor and reread to understand it more later

function getSafeRanges(dangerRange) {
  var commonContainer = dangerRange.commonAncestorContainer;
  // Starts -- Work inward from the start, selecting the largest safe range
  var s = new Array(0), rs = new Array(0);
  if (dangerRange.startContainer != commonContainer){
    for(var i = dangerRange.startContainer; i != commonContainer; i = i.parentNode){
      s.push(i)
    }
  }
  if (0 < s.length){
    for(var i = 0; i < s.length; i++) {
      var xs = document.createRange();
      if (i){
        xs.setStartAfter(s[i-1]);
        xs.setEndAfter(s[i].lastChild);
      }
      else {
        xs.setStart(s[i], dangerRange.startOffset);
        xs.setEndAfter(
          (s[i].nodeType == Node.TEXT_NODE)
          ? s[i] : s[i].lastChild
        );
      }
      rs.push(xs);
    }
  }

  // Ends -- basically the same code reversed
  var e = new Array(0), re = new Array(0);
  if (dangerRange.endContainer != commonContainer){
    for(var i = dangerRange.endContainer; i != commonContainer; i = i.parentNode){
      e.push(i)
    }
  }

  if (0 < e.length){
    for(var i = 0; i < e.length; i++) {
        var docRange = document.createRange();
        if (i) {
            docRange.setStartBefore(e[i].firstChild);
            docRange.setEndBefore(e[i-1]);
        } else {
            docRange.setStartBefore(
                (e[i].nodeType == Node.TEXT_NODE)
                ? e[i] : e[i].firstChild
            );
            docRange.setEnd(e[i], dangerRange.endOffset);
        }
        re.unshift(docRange);
    }
  }
  // Middle -- the uncaptured middle
  if ((0 < s.length) && (0 < e.length)) {
      var xm = document.createRange();
      xm.setStartAfter(s[s.length - 1]);
      xm.setEndBefore(e[e.length - 1]);
  }
  else {
      return [dangerRange];
  }

  // Concat
  rs.push(xm);
  response = rs.concat(re);

  // Send to Console
  return response;
}

function highlightSelection() {
    var userSelection = window.getSelection().getRangeAt(0),
        safeRanges = getSafeRanges(userSelection);

    console.log('safeRanges', safeRanges);
    for (var i = 0; i < safeRanges.length; i++) {
        highlightRange(safeRanges[i]);
    }
}

function highlightRange(range) {
    var newNode = document.createElement("div");
    newNode.setAttribute(
       "style",
       "background-color: yellow; display: inline;"
    );
    range.surroundContents(newNode);
}
