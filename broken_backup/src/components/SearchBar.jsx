import { useId } from 'react';
import Icon from './Icon';

export default function SearchBar({ className, placeholder = 'Search...', onSubmit, ref, children, ...rest }) {
  const id = useId();
  const onSubmitHandler = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form className={'searchbar' + (className ? ' ' + className : '')} aria-label={placeholder} onSubmit={onSubmitHandler}>
      <input ref={ref} type='text' name='query' {...rest} placeholder={placeholder} id={id} role='searchbox' />
      <Icon icon='/icons/search.svg' />
      {children}
    </form>
  );
}
