// JS for styling

// functions
/** @function
 * @name toggleDisplay
 * Toggle display property of given element*/
function toggleDisplay(elementID) {
  var selectedElement = document.querySelector(elementID);
  var currentClassList = Object.values(selectedElement.classList);

  if (currentClassList.includes("d-none")) {
    selectedElement.classList.remove("d-none");
  } else {
    selectedElement.classList.add("d-none");
  }
}