import FormattedInput from './FormattedInput';
import Counter from './Counter';
import { useEffect, useId, useRef } from 'react';

export default function Input({ placeholder, invalidMsg, mainClassName, type, options = [], ...props }) {
  const id = useId();
  if (type === 'hidden') return <input type={type} {...props} id={id} />;
  if (type === 'counter') return <Counter {...props} id={id} placeholder={placeholder} />;
  const inputRef = useRef();

  let _Input = <input ref={inputRef} type={type} {...props} id={id} placeholder=' ' />;

  if (type === 'select') {
    _Input = (
      <select {...props} id={id} data-default={props.defaultValue} ref={inputRef}>
        {props.children ||
          options.map(({ name, ...props }, i) => (
            <option key={i} value={name} {...props}>
              {name}
            </option>
          ))}
      </select>
    );
  } else if (type === 'card') {
    _Input = <FormattedInput format='#### #### #### ####' {...props} id={id} placeholder=' ' />;
  } else if (type === 'expr-date') {
    _Input = <FormattedInput format='mm/yy' {...props} id={id} placeholder=' ' />;
  } else if (type === 'phone') {
    _Input = <FormattedInput format='+## (###) ### ## ##' {...props} id={id} placeholder=' ' />;
  } else if (type === 'textarea') {
    const { children, defaultValue, ...rest } = props;
    _Input = (
      <textarea {...rest} id={id} defaultValue={defaultValue ?? children ?? ''} placeholder=' ' value={children}>
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
      {placeholder && <label htmlFor={id}>{placeholder}</label>}
      <p className='invalid-msg'>{invalidMsg}</p>
    </div>
  );
}
