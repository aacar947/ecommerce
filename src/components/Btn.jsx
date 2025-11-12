import Icon from './Icon';

export default function Btn({ children, icon, className, padding, iconSize = '32px', style, ...props }) {
  return (
    <button className={className ? 'btn ' + className : 'btn'} style={{ padding, ...style }} {...props}>
      {icon ? <Icon icon={icon} size={iconSize} /> : null}
      {children && <span>{children}</span>}
    </button>
  );
}
