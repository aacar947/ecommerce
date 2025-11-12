import React from 'react';
const Icon = React.memo(
  function ({ icon, size, className, ...rest }) {
    return <i className={className ? 'icon ' + className : 'icon'} style={{ '--url': `url(${icon})`, '--icon-size': size ? `${size}` : null }} {...rest}></i>;
  },
  (prev, next) => prev.icon === next.icon && prev.size === next.size && prev.className === next.className
);
export default Icon;
