import '../styles/quick-navbar.css';
import useCategories from '../hooks/useCategories';
import FlatBtn from './FlatBtn';
import { useMemo, useReducer, useRef, useState } from 'react';
import { Link, useMatches } from 'react-router';
import useEventListener from '../hooks/UseEventListener';
import { slugParser } from '../utils/slugParser';
import useBreadCrumbs from '../hooks/useBreadCrumbs';
import Icon from './Icon';
import useDebouncedCallback from '../hooks/useDebouncedCallback';

export default function QuickNavBar() {
  const matches = useMatches();
  const displayQuickNav = matches[matches.length - 1]?.handle?.displayQuickNav || false;

  if (!displayQuickNav) return null;
  return (
    <nav className='quick-bar top-nav'>
      <div id='quick-bar'>
        <CategoryList />
        <BreadCrumbs />
      </div>
    </nav>
  );
}

function CategoryList() {
  const [active, setActive] = useState(false);
  const ref = useRef();
  const { data } = useCategories();

  const categories = useMemo(() => {
    const handleListClick = () => setActive(false);
    return data?.map((category, i) => (
      <li key={category.slug} onClick={handleListClick}>
        <Link to={`/c/${slugParser.slugify({ title: category.name, id: i + 1 })}`} state={{ fromName: 'Home', from: '/' }}>
          {category.name}
        </Link>
      </li>
    ));
  }, [data]);

  useEventListener('click', (e) => {
    if (ref.current && !ref.current.contains(e.target) && active) setActive(false);
  });

  return (
    <div className={'categories-menu' + (active ? ' active' : '')} ref={ref}>
      <FlatBtn className='menu-btn hover-effect categories-menu-btn' iconSize='20px' icon={'/icons/categories.svg'} onClick={() => setActive(!active)} />
      <div className='categories-list'>
        <ul>{categories}</ul>
      </div>
    </div>
  );
}

function BreadCrumbs() {
  const { crumbs } = useBreadCrumbs();

  if (crumbs.length === 0) return null;

  return (
    <div className='breadcrumbs-container'>
      <ul className='breadcrumbs'>
        <li className='breadcrumb'>
          <Link to='/' className='home-crumb underline-hover'>
            <Icon icon='/icons/home.svg' />
          </Link>
        </li>
        {crumbs.map((crumb, i) => {
          return (
            <li className='breadcrumb' key={crumb + i}>
              {crumb.to && (
                <Link className='underline-hover' to={crumb.to}>
                  {crumb.element || crumb.title}
                </Link>
              )}
              {!crumb.to && (crumb.element || <span>{crumb.title}</span>)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
