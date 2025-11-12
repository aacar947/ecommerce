import '../styles/grid.css';

function Grid({ name, children, className, ...rest }) {
  return (
    <div aria-label={name} id={name} className={className ? 'grid ' + className : 'grid'} {...rest}>
      {children}
    </div>
  );
}
export function Row({ name, children, className, ...rest }) {
  return (
    <div id={name} className={className ? 'row flex ' + className : 'row flex'} {...rest}>
      {children}
    </div>
  );
}

export function Col({ name, isContainer = true, children, className, minWidth, maxWidth, style, title, titledBy, ...rest }) {
  if (minWidth) style = { '--col-min-width': minWidth, '--col-max-width': maxWidth, ...style };
  return (
    <section aria-label={title} aria-labelledby={titledBy} id={name} style={style} className={className ? 'col ' + className : 'col'} {...rest}>
      {isContainer && <Container>{children}</Container>}
      {!isContainer && children}
    </section>
  );
}

export function Container({ children, className, ...rest }) {
  return (
    <div className={className ? 'container ' + className : 'container'} {...rest}>
      {children}
    </div>
  );
}

export default Grid;
