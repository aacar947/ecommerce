import HomeSkeleton from './routes/home.skeleton.jsx';
import ProtectedRoutes from './routes/protected-routes';
import ProductsSkeleton from './routes/products.id.skeleton.jsx';
import MainPage from './components/MainPage.jsx';

const routes = [
  {
    Component: MainPage,
    children: [
      {
        path: '/',
        lazy: lazyLoad('home'),
        hydrateFallbackElement: <HomeSkeleton />,
      },
      {
        path: '/search',
        lazy: lazyLoad('search'),
      },
      {
        path: '*',
        lazy: lazyLoad('not-found'),
      },
      {
        path: '/p/:slug',
        lazy: lazyLoad('products.id'),
        hydrateFallbackElement: <ProductsSkeleton />,
      },
      {
        path: '/c/:slug',
        lazy: lazyLoad('categories.name'),
      },
      {
        path: '/cart',
        lazy: lazyLoad('cart'),
      },
      {
        path: '/checkout',
        lazy: lazyLoad('checkout'),
      },
      {
        element: <ProtectedRoutes allowedRoles={['admin']} />,
        children: [
          {
            path: '/store',
            lazy: lazyLoad('store'),
          },
        ],
      },
      {
        element: <ProtectedRoutes allowedRoles={['user', 'admin']} />,
        children: [
          {
            path: '/profile',
            lazy: lazyLoad('profile'),
          },
          {
            path: '/orders',
            lazy: lazyLoad('orders'),
          },
          {
            path: 'orders/details/:id',
            lazy: lazyLoad('orders.details.id'),
          },
          {
            path: '/wishlist',
            lazy: lazyLoad('wishlist'), // Lazy load the Wishlist component
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        path: '/register',
        lazy: lazyLoad('register'),
      },
      {
        path: '/login',
        lazy: lazyLoad('login'),
      },
      {
        path: '/logout',
        lazy: lazyLoad('logout'),
      },
    ],
  },
];

export default routes;

function lazyLoad(path) {
  return async () => {
    const { default: Component, loader, action, handle } = await import(`./routes/${path}.jsx`);
    return {
      Component,
      loader,
      action,
      handle,
    };
  };
}
