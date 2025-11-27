import { useId } from 'react';
import Icon from './Icon';

export default function SearchBar({ className, placeholder = 'Search...', onSubmit, onChange, ref, children, ...rest }) {
  const id = useId();
  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (typeof onSubmit !== 'function') return;
    onSubmit(e);
  };

  return (
    <form className={'searchbar' + (className ? ' ' + className : '')} aria-label={placeholder} onSubmit={onSubmitHandler}>
      <input onChange={onChange} ref={ref} type='text' name='query' {...rest} placeholder={placeholder} id={id} role='searchbox' />
      <Icon icon='/icons/search.svg' className='search-icon' />
      {children}
    </form>
  );
}
