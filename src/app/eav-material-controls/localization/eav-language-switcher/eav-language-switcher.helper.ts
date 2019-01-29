export class LangSwitchHelper {
  initMouseScroll() {
    const html = document.querySelector('html');
    const header = <HTMLElement>document.querySelector('.scrollable');
    let oldScrollBehavior;
    let positionX;

    header.addEventListener('mousedown', registerScroll);

    function registerScroll(event) {
      console.log('Petar registerScroll');
      oldScrollBehavior = header.style['scroll-behavior'];
      header.style['scroll-behavior'] = 'auto';
      positionX = event.pageX;
      html.addEventListener('mousemove', doScroll);
      html.addEventListener('mouseup', removeScroll);
      html.addEventListener('mouseleave', removeScroll);
    }

    function removeScroll(event) {
      console.log('Petar removeScroll');
      header.style['scroll-behavior'] = oldScrollBehavior;
      html.removeEventListener('mousemove', doScroll);
      html.removeEventListener('mouseup', removeScroll);
      html.removeEventListener('mouseleave', removeScroll);
    }

    function doScroll(event) {
      console.log('Petar doScroll');
      const newPositionX = event.pageX;
      if (newPositionX < positionX) {
        header.scrollLeft += positionX - newPositionX;
      } else if (newPositionX > positionX) {
        header.scrollLeft += -(newPositionX - positionX);
      }
      positionX = newPositionX;
    }
  }

  initTouchScroll() {
    const header = <HTMLElement>document.querySelector('.scrollable');
    let oldOverflowX;

    header.addEventListener('touchstart', registerMobileScroll);

    function registerMobileScroll(event) {
      console.log('Petar registerMobileScroll');
      oldOverflowX = header.style['overflow-x'];
      header.style['overflow-x'] = 'scroll';
      header.addEventListener('touchend', removeMobileScroll);
      header.addEventListener('touchcancel', removeMobileScroll);
    }

    function removeMobileScroll(event) {
      console.log('Petar removeMobileScroll');
      header.style['overflow-x'] = oldOverflowX;
      header.removeEventListener('touchend', removeMobileScroll);
      header.removeEventListener('touchcancel', removeMobileScroll);
    }
  }

  initCenterSelected() {
    const header = document.querySelector('.scrollable');
    const buttons = document.querySelectorAll('.buttons');
    const moveThreshold = 2;
    let positionX;
    let positionY;

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.addEventListener('click', doMove);
      button.addEventListener('mousedown', saveInitialPosition);
    }

    function saveInitialPosition(event) {
      positionX = event.pageX;
      positionY = event.pageY;
    }

    function stopIfMouseMoved(event) {
      const newPositionX = event.pageX;
      const newPositionY = event.pageY;

      const newTotal = newPositionX + newPositionY;
      const oldTotal = positionX + positionY;

      if (Math.abs(oldTotal - newTotal) > moveThreshold) {
        return true;
      }
      return false;
    }

    function doMove(event) {
      const stop = stopIfMouseMoved(event);
      if (stop) {
        return;
      }
      console.log('Petar doMove');

      const button = event.target;
      const buttonOffset = button.getBoundingClientRect().left;
      const buttonWidth = button.getBoundingClientRect().width;
      const headerOffset = header.getBoundingClientRect().left;
      const headerWidth = header.getBoundingClientRect().width;

      const currentPosition = buttonOffset + buttonWidth / 2;
      const moveTo = headerOffset + headerWidth / 2;

      header.scrollLeft += currentPosition - moveTo;
    }
  }
}
