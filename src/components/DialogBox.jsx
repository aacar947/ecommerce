import '../styles/dialogbox.css';
import Btn from './Btn';
import Icon from './Icon';

export default function DialogBox({ className, onCancel, content, onConfirm, title, message, confirmText = 'Ok', confirmBtnClass = 'confirm', cancelBtnClass = 'danger', icon }) {
  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='dialog-title'
      aria-describedby='dialog-message'
      className={'dialog center-self' + (className ? ' ' + className : '')}
      onKeyDown={(e) => e.key === 'Escape' && onCancel?.()}
      tabIndex={-1}
    >
      <div className='dialog-form'>
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
      </div>
    </div>
  );
}
