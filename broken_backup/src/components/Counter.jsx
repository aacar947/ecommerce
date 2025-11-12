import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function Counter({ className, type, min, max, defaultValue = 0, onChange, disabled, value, ...props }) {
  const [count, setCount] = useState(value ?? defaultValue ?? 0);
  const ref = useRef(null);
  const hasChanged = useRef(false);

  const handleCount = (value) => {
    if (!hasChanged.current) hasChanged.current = true;
    if (min !== undefined && value < min) return setCount(min);
    if (max !== undefined && value > max) return setCount(max);
    setCount(value + '');
  };

  const updateCount = (amt) => {
    if (count === '') return handleCount(0);
    const total = parseInt(count) + amt;
    handleCount(total);
  };

  const handleChange = (e) => {
    if (e.target.value === '') return setCount('');
    const total = parseInt(e.target.value) || 0;
    handleCount(total);
  };

  useLayoutEffect(() => {
    if (!hasChanged.current) return;
    const input = ref.current.querySelector('input');
    if (onChange) onChange({ target: input });
  }, [count]);

  useLayoutEffect(() => {
    if (value === undefined || value === count) return;
    handleCount(value);
  }, [value]);

  return (
    <div ref={ref} className={'text-input styled-input-container counter' + (className ? ' ' + className : '')}>
      <button disabled={disabled} type='button' className='counter-btn decrement' onClick={() => updateCount(-1)}>
        -
      </button>
      <input className='counter-input' type='text' {...props} onChange={handleChange} value={count} />
      <button disabled={disabled} type='button' className='counter-btn increment' onClick={() => updateCount(1)}>
        +
      </button>
    </div>
  );
}
