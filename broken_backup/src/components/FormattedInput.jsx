import { useEffect, useRef } from 'react';
import { formatString } from '../utils/utils.js';

export default function FormattedInput({ format, onChange, defaultValue, ...props }) {
  const ref = useRef(null);
  const handleChange = (e) => {
    console.log(e.target.value);
    e.target.value = formatString(e.target.value, format);
    if (onChange) onChange(e);
  };

  useEffect(() => {
    if (ref.current) ref.current.value = formatString(defaultValue, format);
  }, [format, defaultValue]);

  return <input data-format={format} onChange={handleChange} ref={ref} {...props} />;
}
