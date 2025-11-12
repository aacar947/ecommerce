import Icon from './Icon';

export default function FlatBtn({ icon, children, className, iconSize, ...rest }) {
  return (
    <button className={'btn-flat' + (className ? ' ' + className : '')} {...rest}>
      {icon && <Icon icon={icon} size={iconSize} />}
      {children}
    </button>
  );
}
