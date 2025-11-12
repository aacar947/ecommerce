import React, { isValidElement, useCallback, useRef, useState } from 'react';
import '../styles/sidebar.css';
import { Link, useLocation } from 'react-router';
import Icon from './Icon';
import Badge from './Badge';
import Overlay from './Overlay';
import useEventListener from '../hooks/UseEventListener';

export default function Sidebar({ list = [] }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const ref = useRef();

  const handleClick = (e) => {
    if (!e.target.classList.contains('sidebar-item')) return;
    setShowSidebar(false);
  };

  const handlefocus = useCallback(
    (e) => {
      if (ref.current.contains(e.target)) return;
      setShowSidebar(false);
    },
    [setShowSidebar]
  );

  useEventListener('focusin', handlefocus, window, { enabled: showSidebar });

  return (
    <aside ref={ref} className='sidebar-container' data-active={showSidebar}>
      <Overlay active={showSidebar} setActive={setShowSidebar} />
      <MenuBtn showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <SidebarList list={list} showSidebar={showSidebar} handleClick={handleClick} />
    </aside>
  );
}

function SidebarList({ list, showSidebar, handleClick }) {
  return (
    <div id='sidebar' data-active={showSidebar}>
      <div className='sidebar-inner'>
        <ul onClick={handleClick}>
          {list.map((item, i) => {
            const key = 'sidebar' + i;
            if (!item) return null;
            if (isValidElement(item)) return React.cloneElement(item, { key });
            const { icon, name, to, action, title, notificationCount, children } = item;
            return (
              <ListItem key={key} {...{ icon, name, to, action, notificationCount, title }}>
                {children}
              </ListItem>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MenuBtn({ showSidebar, setShowSidebar }) {
  const toggleMenu = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <button onClick={toggleMenu} id='menu-btn' className='menu-btn' data-active={showSidebar} tabIndex={0}>
      <div className='menu-btn-icon'>
        <div className='menu-bar bar-1' />
        <div className='menu-bar bar-2' />
        <div className='menu-bar bar-3' />
      </div>
    </button>
  );
}

function ListItem({ icon, children, to, action, notificationCount, title }) {
  const location = useLocation();
  const inner = (
    <>
      {icon && <Icon icon={icon} size='16px' className='sidebar-item' />}
      {children}
      <div className='sidebar-item'>{title.toUpperCase()}</div>
    </>
  );
  return (
    <li className='badge-container'>
      {<Badge count={notificationCount} />}
      {to ? (
        <Link to={to} className='flex sidebar-btn sidebar-item hover-effect' state={{ from: location.pathname }}>
          {inner}
        </Link>
      ) : (
        <div onClick={action} className='sidebar-btn flex sidebar-item hover-effect'>
          {inner}
        </div>
      )}
    </li>
  );
}
