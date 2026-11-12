import { useRef, useState } from 'react';
import { ChevronDown } from 'react-bootstrap-icons';

export const MobileDisclosure = ({ id, titleId, mobile, heading, headingClassName = '', preview, actionLabels, children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <header className={'mobile-disclosure-heading ' + headingClassName + (open ? ' is-open' : '')}>
        {heading}
        {mobile && preview && !open && <p className="mobile-disclosure-preview" aria-hidden="true" data-butterfly-avoid>{preview}</p>}
        {mobile && actionLabels && <span id={id + '-action'} className="mobile-disclosure-action" data-butterfly-avoid>{open ? actionLabels.open : actionLabels.closed}</span>}
        {mobile && (
          <button
            ref={triggerRef}
            type="button"
            className="mobile-disclosure-trigger"
            aria-labelledby={titleId}
            aria-controls={id}
            aria-describedby={actionLabels ? id + '-action' : undefined}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="disclosure-chevron"><ChevronDown aria-hidden="true" /></span>
          </button>
        )}
      </header>
      <div id={id} className="mobile-disclosure-panel" hidden={mobile && !open}>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </>
  );
};
