import '../styles/circular-progress-bar.css';

export default function CircularProgressBar({ progress, isCompleted }) {
  const circumference = 36.57;
  const _progress = circumference - (progress / 100) * circumference;
  return (
    <div className={'circular-progress-bar' + (isCompleted ? ' completed' : '')} role='progressbar' aria-valuenow={progress} aria-valuemin='0' aria-valuemax='100' aria-live='polite'>
      <svg width='100%' height='100%' viewBox='0 0 12.7 12.7' version='1.1' id='svg1' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'>
        <defs id='defs1' />
        <circle style={{ fill: 'none', stroke: '#d4d4d4ff', strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round' }} className='progress-bar-bg' cx='6.35' cy='6.35' r='5.82' />
        <circle
          style={{ fill: 'none', stroke: '#000000', strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round', strokeDashoffset: _progress, strokeDasharray: circumference }}
          className='progress-bar'
          cx='6.35'
          cy='6.35'
          r='5.82'
        />
      </svg>
    </div>
  );
}
