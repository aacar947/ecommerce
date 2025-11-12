import FormattedInput from './FormattedInput';
import Counter from './Counter';
import { useEffect, useRef } from 'react';

export default function Input({ placeholder, invalidMsg, mainClassName, type, options = [], ...props }) {
  if (type === 'hidden') return <input type={type} {...props} />;
  if (type === 'counter') return <Counter {...props} placeholder={placeholder} />;
  const inputRef = useRef();

  let _Input = <input ref={inputRef} type={type} {...props} placeholder=' ' />;

  if (type === 'select') {
    _Input = (
      <select {...props} data-default={props.defaultValue} ref={inputRef}>
        {props.children ||
          options.map(({ name, ...props }, i) => (
            <option key={i} value={name} {...props}>
              {name}
            </option>
          ))}
      </select>
    );
  } else if (type === 'card') {
    _Input = <FormattedInput format='#### #### #### ####' {...props} placeholder=' ' />;
  } else if (type === 'expr-date') {
    _Input = <FormattedInput format='mm/yy' {...props} placeholder=' ' />;
  } else if (type === 'phone') {
    _Input = <FormattedInput format='+## (###) ### ## ##' {...props} placeholder=' ' />;
  } else if (type === 'textarea') {
    const { children, defaultValue, ...rest } = props;
    _Input = (
      <textarea {...rest} defaultValue={defaultValue ?? children ?? ''} placeholder=' ' value={children}>
        {children || defaultValue}
      </textarea>
    );
  }

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = props.defaultValue || '';
  }, [props.defaultValue]);

  return (
    <div className={'text-input styled-input-container' + (mainClassName ? ' ' + mainClassName : '')}>
      {_Input}
      {placeholder && <label htmlFor={props.name}>{placeholder}</label>}
      <p className='invalid-msg'>{invalidMsg}</p>
    </div>
  );
}
