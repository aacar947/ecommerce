import Icon from './Icon';

export default function Btn({ children, icon, className, padding, iconSize = '32px', style, ...props }) {
  return (
    <button {...props} className={className ? 'btn ' + className : 'btn'} style={{ padding, ...style }}>
      {icon ? <Icon icon={icon} size={iconSize} /> : null}
      {children && <span>{children}</span>}
    </button>
  );
}
