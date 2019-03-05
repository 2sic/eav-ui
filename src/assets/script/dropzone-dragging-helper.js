const dropzoneId = 'dropzone';
const dropzoneClass = '.dropzone';
const draggingClass = 'eav-dragging';

/**
 * prevent drop on page - can only drop on dropzone, add eav-dragging class
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
 * add draggingClass to body when something is dragged over
 */
(function addDraggingClassToBody() {
  let timeouts = [];
  window.addEventListener('dragover', function () {
    clearTimeouts(timeouts);
    document.body.classList.add(draggingClass);
  });
  window.addEventListener('drop', function () {
    document.body.classList.remove(draggingClass);
  });
  window.addEventListener('dragleave', function () {
    const timeout = setTimeout(function () {
      document.body.classList.remove(draggingClass);
    }, 50);
    timeouts.push(timeout);
  });
})();

/**
 * add draggingClass to dropzone over which something is dragged
 */
(function addDraggingClassToDropzones() {
  let dropzones;
  let dropzoneTimeouts = [];
  let windowTimeouts = [];
  let listeners = [];
  let activeDropzoneIndex;
  let previousDropzoneIndex;

  window.addEventListener('dragover', function () {
    clearTimeouts(windowTimeouts);
    initDropzones();
  });
  window.addEventListener('drop', function () {
    clearAllDropzonesAndListeners();
  });
  window.addEventListener('dragleave', function () {
    const timeout = setTimeout(clearAllDropzonesAndListeners, 50);
    windowTimeouts.push(timeout);
  });

  function initDropzones() {
    if (dropzones) return;
    dropzones = document.querySelectorAll(dropzoneClass);

    for (let i = 0; i < dropzones.length; i++) {
      const dropzone = dropzones[i];
      const addClassBind = addClass.bind(null, dropzone, i);
      dropzone.addEventListener('dragover', addClassBind);
      dropzone.addEventListener('drop', clearAllDropzonesAndListeners);
      dropzone.addEventListener('dragleave', addClearClassesTimeout);
      listeners.push({ el: dropzone, type: 'dragover', func: addClassBind });
      listeners.push({ el: dropzone, type: 'drop', func: clearAllDropzonesAndListeners });
      listeners.push({ el: dropzone, type: 'dragleave', func: addClearClassesTimeout });
    }
  }

  function addClass(dropzone, index) {
    clearTimeouts(windowTimeouts);
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
    clearListeners(listeners);
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
