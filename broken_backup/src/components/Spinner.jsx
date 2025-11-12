import '../styles/spinner.css';
export default function PageSpinner({ className, ...rest }) {
  return (
    <div className={'loader' + (className ? ' ' + className : '')} {...rest}>
      <div className='spinner'>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
