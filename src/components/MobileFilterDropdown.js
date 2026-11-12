import { useEffect, useRef, useState } from 'react';
import { Check2, ChevronDown } from 'react-bootstrap-icons';

const focusOption = (item) => {
  item?.focus({ preventScroll: true });
  if (item?.parentElement && item.parentElement.scrollHeight > item.parentElement.clientHeight) item.scrollIntoView?.({ block: 'nearest' });
};

export const MobileFilterDropdown = ({ id, label, value, options, onChange, sound }) => {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const items = useRef([]);
  const focusIndex = useRef(0);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };
  const expand = (index = options.findIndex((option) => option.id === value)) => {
    focusIndex.current = Math.max(0, index);
    const box = trigger.current.getBoundingClientRect();
    setAbove(window.innerHeight - box.bottom < 250 && box.top > 250);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    focusOption(items.current[focusIndex.current]);
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const resize = () => { if (window.innerWidth >= 768) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [open]);

  const navigate = (event) => {
    const current = items.current.indexOf(document.activeElement);
    const count = options.length;
    const next = { ArrowDown: (current + 1) % count, ArrowUp: (current + count - 1) % count, Home: 0, End: count - 1 }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      focusOption(items.current[next]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') close(true);
  };

  return (
    <div ref={root} className="mobile-filter-dropdown" data-sound={sound} data-butterfly-avoid>
      <button ref={trigger} className="mobile-filter-toggle" type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={id} onClick={() => open ? close() : expand()} onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          expand(event.key === 'ArrowDown' ? 0 : options.length - 1);
        } else if (event.key === 'Escape') close();
      }}>Filter <ChevronDown aria-hidden="true" /></button>
      {open && <div className={'mobile-filter-menu' + (above ? ' opens-above' : '')} id={id} role="menu" aria-label={label} onKeyDown={navigate} data-butterfly-avoid>
        {options.map((option, index) => <button key={option.id} ref={(element) => { items.current[index] = element; }} className="mobile-filter-option" type="button" role="menuitemradio" aria-checked={value === option.id} tabIndex={-1} onClick={() => { onChange(option.id); close(true); }}><span>{option.label}</span>{value === option.id && <Check2 aria-hidden="true" />}</button>)}
      </div>}
    </div>
  );
};
