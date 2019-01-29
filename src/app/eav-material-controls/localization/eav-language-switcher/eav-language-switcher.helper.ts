export class LangSwitchHelper {
  initMouseScroll(renderer, headerRef) {
    const header = headerRef.nativeElement;
    let oldScrollBehavior;
    let positionX;
    let documentMousemove;
    let documentMouseup;
    let documentMouseleave;

    renderer.listen(header, 'mousedown', registerScroll);

    function registerScroll(event) {
      console.log('Petar registerScroll');
      const headerStyles = getComputedStyle(header);
      oldScrollBehavior = headerStyles['scroll-behavior'];
      renderer.setStyle(header, 'scroll-behavior', 'auto');
      positionX = event.pageX;
      documentMousemove = renderer.listen('document', 'mousemove', doScroll);
      documentMouseup = renderer.listen('document', 'mouseup', removeScroll);
      documentMouseleave = renderer.listen('document', 'mouseleave', removeScroll);
    }

    function removeScroll(event) {
      console.log('Petar removeScroll');
      renderer.setStyle(header, 'scroll-behavior', oldScrollBehavior);
      documentMousemove();
      documentMouseup();
      documentMouseleave();
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

  initTouchScroll(renderer, headerRef) {
    const header = headerRef.nativeElement;
    let oldOverflowX;
    let headerTouchend;
    let headerTouchcancel;

    renderer.listen(header, 'touchstart', registerMobileScroll);

    function registerMobileScroll(event) {
      console.log('Petar registerMobileScroll');
      const headerStyles = getComputedStyle(header);
      oldOverflowX = headerStyles['overflow-x'];
      renderer.setStyle(header, 'overflow-x', 'scroll');
      headerTouchend = renderer.listen(header, 'touchend', removeMobileScroll);
      headerTouchcancel = renderer.listen(header, 'touchcancel', removeMobileScroll);
    }

    function removeMobileScroll(event) {
      console.log('Petar removeMobileScroll');
      renderer.setStyle(header, 'overflow-x', oldOverflowX);
      headerTouchend();
      headerTouchcancel();
    }
  }

  initCenterSelected(renderer, headerRef, buttonsRef) {
    const header = headerRef.nativeElement;
    const buttons = [];
    buttonsRef._results.forEach(element => {
      buttons.push(element._elementRef.nativeElement);
    });
    const moveThreshold = 2;
    let positionX;
    let positionY;

    buttons.forEach(button => {
      renderer.listen(button, 'click', doMove);
      renderer.listen(button, 'mousedown', saveInitialPosition);
    });

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
