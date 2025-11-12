import '../styles/spinner.css';
export default function PageSpinner() {
  return (
    <div className='fill-page page-loader'>
      <div className='loader center-self'>
        <div className='spinner'>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
