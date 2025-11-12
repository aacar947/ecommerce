import Icon from './Icon';

export default function TextWithIcon({ children, icon, pClassName }) {
  return (
    <div style={{ gap: '5px' }} className='flex center-all'>
      <Icon icon={icon} size='24px' />
      <p style={{ width: '100%' }} className={pClassName}>
        {children}
      </p>
    </div>
  );
}
