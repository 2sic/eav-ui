const dropzoneId = 'dropzone';
const dropzoneClass = 'dropzone';
const dropzoneDisabledClass = 'dropzone-disabled';
const draggingClass = 'eav-dragging';

/**
 * prevent drop on page - can only drop on dropzone
 */
window.addEventListener('dragover', function (event) {
  if (event.target.id !== dropzoneId) {
    event.preventDefault();
  }
});
window.addEventListener('drop', function (event) {
  if (event.target.id !== dropzoneId) {
    event.preventDefault();
  }
});

/**
 * Add draggingClass to body when something is dragged over and
 * add draggingClass to dropzone over which something is dragged
 */
(function addDraggingClass() {
  let windowBodyTimeouts = [];
  let dropzones;
  let dropzoneTimeouts = [];
  let windowDropzonesTimeouts = [];
  let dropzonesListeners = [];
  let activeDropzoneIndex;
  let previousDropzoneIndex;

  // listeners on window
  window.addEventListener('dragover', function () {
    clearTimeouts(windowBodyTimeouts);
    document.body.classList.add(draggingClass);
    clearTimeouts(windowDropzonesTimeouts);
    initDropzones();
  });
  window.addEventListener('drop', function () {
    document.body.classList.remove(draggingClass);
    clearAllDropzonesAndListeners();
  });
  window.addEventListener('dragleave', function () {
    let timeout = setTimeout(function () { document.body.classList.remove(draggingClass); }, 50);
    windowBodyTimeouts.push(timeout);
    timeout = setTimeout(clearAllDropzonesAndListeners, 50);
    windowDropzonesTimeouts.push(timeout);
  });

  function initDropzones() {
    if (dropzones) return;
    const dropzonesSelector = '.' + dropzoneClass + ':not(.' + dropzoneDisabledClass + ')';
    dropzones = document.querySelectorAll(dropzonesSelector);

    for (let i = 0; i < dropzones.length; i++) {
      const dropzone = dropzones[i];
      const addClassBind = addClass.bind(null, dropzone, i);

      // listeners on dropzones
      dropzone.addEventListener('dragover', addClassBind);
      dropzone.addEventListener('drop', clearAllDropzonesAndListeners);
      dropzone.addEventListener('dragleave', addClearClassesTimeout);
      dropzonesListeners.push({ el: dropzone, type: 'dragover', func: addClassBind });
      dropzonesListeners.push({ el: dropzone, type: 'drop', func: clearAllDropzonesAndListeners });
      dropzonesListeners.push({ el: dropzone, type: 'dragleave', func: addClearClassesTimeout });
    }
  }

  function addClass(dropzone, index) {
    clearTimeouts(windowBodyTimeouts);
    document.body.classList.add(draggingClass);
    clearTimeouts(windowDropzonesTimeouts);
    clearTimeouts(dropzoneTimeouts);
    activeDropzoneIndex = index;
    if (activeDropzoneIndex !== previousDropzoneIndex) {
      clearClassFromElements(draggingClass, dropzones);
      previousDropzoneIndex = index;
    }
    dropzone.classList.add(draggingClass);
  }

  function addClearClassesTimeout() {
    const clearClassesBind = clearClassFromElements.bind(null, draggingClass, dropzones);
    const timeout = setTimeout(clearClassesBind, 50);
    dropzoneTimeouts.push(timeout);
  }

  function clearAllDropzonesAndListeners() {
    if (!dropzones) return;
    clearListeners(dropzonesListeners);
    clearClassFromElements(draggingClass, dropzones);
    dropzones = null;
  }
})();

// add draggingClass helpers
function clearTimeouts(timeoutsArray) {
  for (let i = 0; i < timeoutsArray.length; i++) {
    clearTimeout(timeoutsArray[i]);
  }
  timeoutsArray.splice(0, timeoutsArray.length);
}
function clearClassFromElements(cssClass, elementsArray) {
  for (let i = 0; i < elementsArray.length; i++) {
    elementsArray[i].classList.remove(cssClass);
  }
}
function clearListeners(listenersArray) {
  for (let i = 0; i < listenersArray.length; i++) {
    const element = listenersArray[i].el;
    const type = listenersArray[i].type;
    const func = listenersArray[i].func;
    element.removeEventListener(type, func);
  }
  listenersArray.splice(0, listenersArray.length);
}
