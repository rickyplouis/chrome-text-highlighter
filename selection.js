document.addEventListener('mouseup', function(event) {
  var userSelection = window.getSelection().getRangeAt(0)
  highlightSelection(userSelection)
  var highlightedText = document.getElementById("highlightedText")
  addPopup(highlightedText)
});

function addPopup(container){
  var popup = document.createElement("span")
  var popuptext = document.createElement("span")
  popup.classList.add('popup');
  popuptext.classList.add("popuptext", "show")
  popuptext.innerHTML = "Hello popup"
  popup.append(popuptext)
  container.append(popup)
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

function highlightSelection(userSelection) {
  // only fire if selected text exists
  if (userSelection.toString().length > 0){
    var safeRanges = getSafeRanges(userSelection);
    safeRanges.map( function(range) {highlightRange(range)})
  }
}

function highlightRange(range) {
  var newNode = document.createElement("div")
  newNode.setAttribute(
    "id",
    "highlightedText"
  )
  newNode.setAttribute(
     "style",
     "background-color: yellow; display: inline;"
  );
  range.surroundContents(newNode);
}
