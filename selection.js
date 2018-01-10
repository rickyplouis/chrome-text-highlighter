document.addEventListener('mouseup', function(event) {
  var userSelection = window.getSelection().getRangeAt(0)
  highlightSelection(userSelection)

});

/**
 * Create Element helper function
 * @param {string} tagName - Name of element to create
 * @param {string} text - Text to put inside of element
 * @return {Element}
 */
function makeElement(tagName, text){
  var element = document.createElement(tagName)
  if (text){
    element.innerHTML = text
  }
  return element
}

/**
 * Starts at bottom of dom tree and creates an array of parentNodes
 * until it reaches the commonContainer
 * @param {Node} container - A Node to begin the traversal
 * @param {Node} commonContainer - The base node to finish traversing at
 * @param {Array} reversedTree - Array of nodes set into a tree
*/
function treeReversal(container, commonContainer, reversedTree){
  return container != commonContainer ?
    treeReversal(container.parentNode, commonContainer, reversedTree.concat(container)) : reversedTree;
}


/**
 * If a user selects a range spanning multiple elements this function
 * creates a safe range of elements that can be wrapped around
 * @param {Range} userRange - user selected range
 * @return {Array} array of safe ranges
 */
function getSafeRanges(userRange) {
  var commonContainer = userRange.commonAncestorContainer;
  // Starts -- Work inward from the start, selecting the largest safe range
  var beginRanges = new Array(0),
      sortedBegin = new Array(0);
  if (userRange.startContainer != commonContainer){
    beginRanges = treeReversal(userRange.startContainer, commonContainer, [])
  }
  if (0 < beginRanges.length){
    for(var i = 0; i < beginRanges.length; i++) {
      var currNode = beginRanges[i],
          currRange = document.createRange();

      if (i === 0){
        currRange.setStart(currNode, userRange.startOffset);
        currRange.setEndAfter( (currNode.nodeType == Node.TEXT_NODE) ? currNode : currNode.lastChild);
      }
      else {
        currRange.setStartAfter(beginRanges[i-1]);
        currRange.setEndAfter(currNode.lastChild);
      }
      sortedBegin.push(currRange);
    }
  }

  // Ends -- basically the same code reversed
  var endRanges = new Array(0),
      sortedEnd = new Array(0);

  if (userRange.endContainer != commonContainer){
    endRanges = treeReversal(userRange.endContainer, commonContainer, [])
  }

  if (0 < endRanges.length){
    for(var i = 0; i < endRanges.length; i++) {
        var currentNode = endRanges[i],
            currentRange = document.createRange()

        if (i === 0) {
          currentRange.setStartBefore( (currentNode.nodeType == Node.TEXT_NODE) ? currentNode : currentNode.firstChild );
          currentRange.setEnd(currentNode, userRange.endOffset);
        } else {
          currentRange.setStartBefore(currentNode.firstChild);
          currentRange.setEndBefore(endRanges[i-1]);
        }
        sortedEnd.unshift(currentRange);
    }
  }
  // Middle -- the uncaptured middle
  if ((0 < beginRanges.length) && (0 < endRanges.length)) {
      var midRanges = document.createRange();
      midRanges.setStartAfter(beginRanges[beginRanges.length - 1]);
      midRanges.setEndBefore(endRanges[endRanges.length - 1]);
  }
  else {
      return [userRange];
  }

  return sortedBegin.concat(midRanges, sortedEnd)
}

function safeHighlights (userSelection){
  return new Promise(function(resolve, reject) {
    var safeHighlights = getSafeRanges(userSelection).map( function(range) {highlightRange(range)})
    return safeHighlights.length > 0 ? resolve(safeHighlights) : reject([])
  });
}

/**
 * Get all elements with highlightedText class
 * and set background-color to be none as well as remove
 * the class attached
 */
function removeHighlight(){
  var highlights = document.getElementsByClassName("highlightedText")
  Array.prototype.map.call(highlights, function(highlight){
    highlight.setAttribute(
      'style',
      'background-color: none; display: inline;'
    )
    highlight.removeAttribute('class')
  })
}

/**
 * Only fire safe highlights if user selection
 * contains text after the mouse event
 * else if no text selected then unhighlight text
 * @param {Range}
 */
function highlightSelection(userSelection) {
  if (userSelection.toString().length > 0){
    safeHighlights(userSelection).then(function(){
      console.log('highlighted userSelection', userSelection);
    }).catch( function(error){
      console.log('error highlighting selection', error);
    })
  } else {
    removeHighlight()
  }
}

/**
 * Create div with highlightedText class
 * to wrap user selection range
 * @param {Range}
 */
function highlightRange(range) {
  var newNode = makeElement("div")
  newNode.setAttribute(
    "class",
    "highlightedText"
  )
  newNode.setAttribute(
     "style",
     "background-color: yellow; display: inline;"
  );
  range.surroundContents(newNode);
}
