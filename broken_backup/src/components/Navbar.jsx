import { useCallback, useEffect, useMemo, useRef } from 'react';
import Btn from './Btn.jsx';
import Logo from './Logo.jsx';
import ProfilePic from './ProfilePic.jsx';
import Sidebar from './Sidebar.jsx';
import { Link, useLocation, useNavigate } from 'react-router';
import useModal from '../hooks/useModal.jsx';
import useDebounce from '../hooks/useDebounce.jsx';
import '../styles/searchbar.css';
import '../styles/navbar.css';
import useCart from '../hooks/useCart.jsx';
import Icon from './Icon.jsx';
import Badge from './Badge.jsx';
import PageSpinner from './PageSpinner.jsx';
import useEventListener from '../hooks/UseEventListener.jsx';
import useUser from '../hooks/useUser.jsx';
import NoResults from './NoResults.jsx';
import { slugParser } from '../utils/slugParser.js';
import useSearchQuery from '../hooks/useSearchQuery.jsx';

const BRING_NAVBAR_DOWN_THRESHOLD = 50;

export default function Navbar() {
  const ref = useRef(null);
  const prevScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const originalHeight = ref.current.offsetHeight;
    // make navbar reappear on scroll up
    const scrollY = window.scrollY;
    if (prevScrollY.current < scrollY) {
      prevScrollY.current = scrollY;
      document.documentElement.style.setProperty('--nav-sticky-top', `-${originalHeight}px`);
    }

    if (prevScrollY.current - scrollY > BRING_NAVBAR_DOWN_THRESHOLD) {
      prevScrollY.current = scrollY;
      document.documentElement.style.setProperty('--nav-sticky-top', '0px');
    }
  }, []);

  useEventListener('scroll', handleScroll);

  return (
    <>
      <nav ref={ref} id='navbar-container' className='top-nav'>
        <div id='navbar'>
          <Logo size='32px' />
          <ToggleSearch />
          <NavButtons />
        </div>
      </nav>
    </>
  );
}

function SearchBar() {
  const [showModal, setShowModal] = useModal({});
  const [query, setQuery] = useDebounce('');
  const navigate = useNavigate();
  const inputRef = useRef();
  const barRef = useRef();

  const handleClick = () => {
    if (query === '') return;
    navigate(`/search?q=${query}`);
    setShowModal(false);
    setQuery('');
  };

  useEffect(() => {
    if (showModal) inputRef.current.focus();
  }, [showModal]);

  return (
    <div className='searchbar-container modal-content justify-self-center flex-col'>
      <div ref={barRef} id='searchbar' style={{ '--searchbar-height': '32px' }}>
        <input onChange={(e) => setQuery(e.target.value)} ref={inputRef} id='search-input' type='text' className='styled-input' name='search' placeholder='Search...' />
        <button onClick={handleClick} id='search-button'>
          <Icon icon='/icons/search.svg' />
        </button>
      </div>
      {query !== '' && <SearchResult query={query} setQuery={setQuery} setShowModal={setShowModal} />}
    </div>
  );
}

function SearchResult({ query, setQuery, setShowModal }) {
  const { data: result, isFetching } = useSearchQuery(new URLSearchParams({ q: query, limit: 16 }));
  const data = useMemo(() => result?.pages.reduce((acc, { products }) => [...acc, ...products], []), [result]) || [];

  if (isFetching) return <PageSpinner />;
  if (data?.length === 0)
    return (
      <div className='search-result'>
        <NoResults size={128} />
      </div>
    );

  const handleClick = () => {
    setQuery('');
    setShowModal(false);
  };

  return (
    <ul className='search-result'>
      {data && data.length > 0 && (
        <li>
          <Link className='search-result-item see-more' onClick={handleClick} to={`/search?q=${query}`}>
            <Icon icon='/icons/search.svg' />
            <span className='result-title'>See more results for "{query}"</span>
          </Link>
          <hr />
        </li>
      )}
      {data?.map((product) => {
        if (!product) return null;
        const slug = slugParser.slugify({ id: product.id, title: product.title });
        return (
          <li key={product.id}>
            <Link className='search-result-item' onClick={handleClick} to={`/p/${slug}`}>
              <div className='thumbnail'>
                <img src={product.thumbnail} alt='' />
              </div>
              <div className='result-title'>
                <p className='align-self-center text-overflow-ellipsis'>{product.title}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ToggleSearch() {
  const [_, setShowModal] = useModal({ Component: SearchBar });
  return (
    <Btn onClick={() => setShowModal(true)} id='toggle-search' className='toggle-search styled-input' iconSize='16px' icon='/icons/search.svg' style={{ '--searchbar-button-padding': '0.5rem' }}>
      Search
    </Btn>
  );
}

function NavButtons() {
  return (
    <div className='nav-btn-group'>
      <Link to='/profile' className='nav-btn-group-item'>
        <ProfilePic />
      </Link>
      <CartBtn />
      <SidebarNav />
    </div>
  );
}

function SidebarNav() {
  const userId = useUser((s) => s.user?.id);
  const isAdmin = useUser((s) => s.user?.role === 'admin');
  const totalQuantity = useCart((state) => state.cart?.totalQuantity || 0);
  const location = useLocation();

  const sidebarList = useMemo(
    () => [
      { children: <ProfilePic />, to: '/profile', title: 'Profile' },
      <hr />,
      location.pathname !== '/' && { icon: '/icons/home.svg', to: '/', title: 'Home' },
      { icon: '/icons/cart.svg', to: '/cart', title: 'Cart', notificationCount: totalQuantity },
      { icon: '/icons/heart.svg', to: '/wishlist', title: 'Wishlist' },
      { icon: '/icons/stock.svg', to: '/orders', title: 'Orders' },
      isAdmin && { icon: '/icons/store.svg', to: '/store', title: 'Store' },
      <hr />,
      userId ? { icon: '/icons/logout.svg', to: '/logout', title: 'Log out' } : { icon: '/icons/login.svg', to: '/login', title: 'Log in' },
      { icon: '/icons/contact.svg', to: '/contact', title: 'Contact' },
    ],
    [userId, totalQuantity, location.pathname]
  );

  return (
    <div id='nav-sidebar-btn' className='nav-btn-group-item'>
      <Sidebar list={sidebarList} />
    </div>
  );
}

function CartBtn() {
  const totalQuantity = useCart((state) => state?.cart?.totalQuantity || 0);
  return (
    <Link to='/cart' className='nav-btn-group-item badge-container'>
      <Icon icon='/icons/cart.svg' size='26px' className='sidebar-item' />
      <Badge className='top-center' count={totalQuantity} />
    </Link>
  );
}
