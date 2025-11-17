import '../styles/dialogbox.css';
import Btn from './Btn';
import FlatBtn from './FlatBtn';
import Icon from './Icon';

export default function DialogBox({ className, onCancel, content, onConfirm, title, message, confirmText = 'Ok', confirmBtnClass = 'confirm', cancelBtnClass = 'light-gray', type = 'info', icon }) {
  const confirmButtonClass = (confirmBtnClass || '') + (type ? ' ' + type : '');
  return (
    <div role='dialog' aria-modal='true' aria-labelledby='dialog-title' aria-describedby='dialog-message' className={'dialog' + (className ? ' ' + className : '')} onKeyDown={(e) => e.key === 'Escape' && onCancel?.()} tabIndex={-1}>
      <div className='dialog-form'>
        <div className='dialog-form-header'>
          <FlatBtn icon='/icons/bold-cross.svg' className='close-btn' onClick={onCancel} />
        </div>
        {type === 'danger' && <Icon className='type-icon warning' icon='/icons/danger.svg' />}
        {type === 'info' && <Icon className='type-icon info' icon='/icons/info.svg' />}
        <div className='dialog-content'>
          {icon && (
            <div className='confirm-icon'>
              <Icon icon={icon} />
            </div>
          )}
          <h2 id='dialog-title'>{title}</h2>
          <p id='dialog-message' className='pale'>
            {message}
          </p>
          {content}
        </div>
        <ActionButtons onCancel={onCancel} onConfirm={onConfirm} confirmText={confirmText} confirmBtnClass={confirmButtonClass} cancelBtnClass={cancelBtnClass} />
      </div>
    </div>
  );
}

function ActionButtons({ onCancel, onConfirm, confirmText = 'Ok', confirmBtnClass = 'confirm', cancelBtnClass = 'light-gray' }) {
  return (
    <div className='btn-group flex'>
      {onCancel && (
        <Btn className={cancelBtnClass} onClick={onCancel}>
          Cancel
        </Btn>
      )}
      <Btn className={confirmBtnClass} onClick={onConfirm} autoFocus>
        {confirmText}
      </Btn>
    </div>
  );
}
