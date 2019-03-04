// prevent drop on page - can only drop on dropzone, add eav-dragging class
const dropzoneId = 'dropzone';
const draggingClass = 'eav-dragging';
let timeouts = [];
window.addEventListener('dragover', function (event) {
  if (event.target.id !== dropzoneId) {
    event.preventDefault();
  }
  timeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
  timeouts = [];
  document.body.classList.add(draggingClass);
  initDropzones();
});
window.addEventListener('drop', function (event) {
  if (event.target.id !== dropzoneId) {
    event.preventDefault();
  }
  document.body.classList.remove(draggingClass);
});
window.addEventListener('dragleave', function (event) {
  const timeout = setTimeout(function () {
    document.body.classList.remove(draggingClass);
  }, 50);
  timeouts.push(timeout);
});

let dropzones;
let dropzoneTimeouts = [];
let listeners = [];
let activeDropzoneIndex;
let previousDropzoneIndex;
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
  dropzoneTimeouts.forEach(dropzoneTimeout => {
    clearTimeout(dropzoneTimeout);
  });
  dropzoneTimeouts = [];
  dropzone.classList.add(draggingClass);
  activeDropzoneIndex = index;
  if (activeDropzoneIndex !== previousDropzoneIndex) {
    clearAllClasses();
    previousDropzoneIndex = index;
  }
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
    clearAllClasses();
  }
  dropzones = null;
}

function clearAllClasses() {
  dropzones.forEach(dropzone => {
    dropzone.classList.remove(draggingClass);
  });
}
