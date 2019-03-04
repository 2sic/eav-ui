/**
 * prevent drop on page - can only drop on dropzone, add eav-dragging class
 */
const dropzoneId = 'dropzone';
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
const draggingClass = 'eav-dragging';
(function addDraggingClassToBody() {
  let timeouts = [];
  window.addEventListener('dragover', function () {
    timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    timeouts = [];
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
    windowTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    windowTimeouts = [];
    initDropzones();
  });
  window.addEventListener('drop', function () {
    clearAllDropzonesAndListeners();
  });
  window.addEventListener('dragleave', function () {
    const timeout = setTimeout(function () {
      clearAllDropzonesAndListeners()
    }, 50);
    windowTimeouts.push(timeout);
  });

  function initDropzones() {
    if (dropzones) return;
    dropzones = document.querySelectorAll('.dropzone');

    dropzones.forEach((dropzone, index) => {
      const addClassBind = addClass.bind(null, dropzone, index);
      dropzone.addEventListener('dragover', addClassBind);
      dropzone.addEventListener('dragleave', addClearDropzonesTimeout);
      dropzone.addEventListener('drop', addClearDropzonesTimeout);
      listeners.push({ el: dropzone, type: 'dragover', func: addClassBind });
      listeners.push({ el: dropzone, type: 'dragleave', func: addClearDropzonesTimeout });
      listeners.push({ el: dropzone, type: 'drop', func: addClearDropzonesTimeout });
    });
  }

  function addClass(dropzone, index) {
    windowTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    windowTimeouts = [];
    dropzoneTimeouts.forEach(dropzoneTimeout => {
      clearTimeout(dropzoneTimeout);
    });
    dropzoneTimeouts = [];
    activeDropzoneIndex = index;
    if (activeDropzoneIndex !== previousDropzoneIndex) {
      dropzones.forEach(dropzone => {
        dropzone.classList.remove(draggingClass);
      });
      previousDropzoneIndex = index;
    }
    dropzone.classList.add(draggingClass);
  }

  function addClearDropzonesTimeout() {
    const timeout = setTimeout(clearAllDropzonesAndListeners, 50);
    dropzoneTimeouts.push(timeout);
  }

  function clearAllDropzonesAndListeners() {
    listeners.forEach(listener => {
      const element = listener.el;
      const type = listener.type;
      const func = listener.func;
      element.removeEventListener(type, func);
    });
    listeners = [];
    if (dropzones) {
      dropzones.forEach(dropzone => {
        dropzone.classList.remove(draggingClass);
      });
    }
    dropzones = null;
  }
})();
