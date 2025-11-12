import { useId } from 'react';
import '../styles/toggle.css';

export default function Toggle({ title, type = 'toggle', id, ...rest }) {
  const inputId = useId();
  const types = ['toggle', 'radio', 'chip'];
  const inputType = types.includes(type) ? type : 'toggle';
  return (
    <div className={'toggle-wrapper ' + inputType} id={id}>
      <input {...rest} id={inputId} type={inputType === 'radio' ? 'radio' : 'checkbox'} />
      <label htmlFor={inputId}>{title}</label>
    </div>
  );
}
