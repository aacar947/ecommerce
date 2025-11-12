import '../styles/select.css';
import { createContext, useContextSelector } from 'use-context-selector';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import useEventListener from '../hooks/UseEventListener';

const SelectContext = createContext();
export default function Select({ className, options, optionProps, icon, children, defaultValue, onChange, name, ...rest }) {
  const _defaultValue = useMemo(() => (typeof defaultValue === 'function' ? defaultValue() : defaultValue), [defaultValue]);
  const [selected, setSelected] = useState({ value: _defaultValue || '', label: '' });
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEventListener('click', (e) => {
    if (ref.current && !ref.current.contains(e.target) && open) setOpen(false);
  });

  const handleChange = (e) => {
    onChange(e);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <SelectContext.Provider value={{ selected, setSelected, name, defaultValue: _defaultValue, open, setOpen }}>
      <div ref={ref} onChange={handleChange} className={'select' + (className ? ` ${className}` : '')} data-name={name} data-value={selected.value} {...rest}>
        <button className='selected hover-effect' onClick={handleClick}>
          {selected.label && <span data-value={selected.label}></span>}
          {selected.children}
          {icon && <Icon icon={icon} />}
        </button>
        <Options options={options} name={name} optionProps={optionProps}>
          {children}
        </Options>
      </div>
    </SelectContext.Provider>
  );
}

function Options({ children, options, optionProps = {} }) {
  const open = useContextSelector(SelectContext, (s) => s.open);

  return (
    <ul className={'options' + (open ? ' open' : '')}>
      {children}
      {options?.map((props, index) => (
        <Option key={props.value + index} {...props} {...optionProps} />
      ))}
    </ul>
  );
}

export function Option({ label, children, value, className, ...rest }) {
  const name = useContextSelector(SelectContext, (s) => s.name);
  const selectedValue = useContextSelector(SelectContext, (s) => s.selected?.value);
  const setSelected = useContextSelector(SelectContext, (s) => s.setSelected);
  const defaultValue = useContextSelector(SelectContext, (s) => s.defaultValue);
  const setOpen = useContextSelector(SelectContext, (s) => s.setOpen);

  useLayoutEffect(() => {
    if (defaultValue === value) setSelected({ value, label, children });
  }, [defaultValue, value, label, setSelected, children]);

  const handleChange = () => {
    setSelected({ value, label, children });
    setOpen(false);
  };

  const id = useId();
  return (
    <li className={'option' + (className ? ' ' + className : '')} {...rest}>
      <input onChange={handleChange} type='radio' name={name} id={id} value={value} data-label={label} checked={selectedValue === value} />
      <label tabIndex='0' htmlFor={id} onClick={() => setOpen(false)} data-selected={selectedValue === value}>
        {children}
        {label}
      </label>
    </li>
  );
}
