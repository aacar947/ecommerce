import '../styles/badge.css';

export default function Badge({ count, className }) {
  return count > 0 && <span className={'badge' + (className ? ` ${className}` : '')}>{count}</span>;
}
