import { copyToClipboard } from "./copy-to-clipboard.helper";

describe('copyToClipboard', () => {
  let appendChildSpy: jasmine.Spy;
  let removeChildSpy: jasmine.Spy;
  let execCommandSpy: jasmine.Spy;
  let selectSpy: jasmine.Spy;

  beforeEach(() => {
    execCommandSpy = spyOn(document, 'execCommand');
    appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();
    removeChildSpy = spyOn(document.body, 'removeChild').and.callThrough();
    selectSpy = spyOn(HTMLTextAreaElement.prototype, 'select');
    // Default getSelection to a safe no-preexisting selection
    spyOn(document, 'getSelection').and.returnValue({
      rangeCount: 0,
      removeAllRanges: jasmine.createSpy('removeAllRanges'),
      addRange: jasmine.createSpy('addRange'),
    } as any);
  });

  it('should call execCommand with "copy"', () => {
    copyToClipboard('hello');
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
  });

  it('should create and append a textarea with correct value and styles', () => {
    copyToClipboard('foo');
    const textarea = appendChildSpy.calls.mostRecent().args[0] as HTMLTextAreaElement;
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
    expect(textarea.value).toBe('foo');
    expect(textarea.getAttribute('readonly')).toBe('');
    expect(textarea.style.position).toBe('absolute');
    expect(textarea.style.left).toBe('-9999px');
  });

  it('should select the textarea content before copying', () => {
    copyToClipboard('test');
    expect(selectSpy).toHaveBeenCalled();
  });

  it('should remove the textarea after copying', () => {
    copyToClipboard('xyz');
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('should restore the original selection if there was one', () => {
    const mockRange = {} as Range;
    const mockSel = {
      rangeCount: 1,
      getRangeAt: jasmine.createSpy('getRangeAt').and.returnValue(mockRange),
      removeAllRanges: jasmine.createSpy('removeAllRanges'),
      addRange: jasmine.createSpy('addRange'),
    };
    (document.getSelection as jasmine.Spy).and.returnValue(mockSel as any);

    copyToClipboard('with-selection');

    expect(mockSel.getRangeAt).toHaveBeenCalledWith(0);
    expect(mockSel.removeAllRanges).toHaveBeenCalled();
    expect(mockSel.addRange).toHaveBeenCalledWith(mockRange);
  });

  it('should do nothing when there is no pre-existing selection', () => {
    copyToClipboard('no-selection');
    const sel = document.getSelection() as any;
    expect(sel.removeAllRanges).not.toHaveBeenCalled();
    expect(sel.addRange).not.toHaveBeenCalled();
  });
});