import { Outlet } from 'react-router';
import AuthProvider from './contexts/AuthProvider';
import UserProvider from './contexts/UserProvider';
import ModalProvider from './contexts/ModalProvider';
import CartProvider from './contexts/CartProvider';
import NavigationStateProvider from './contexts/NavigationStateProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoadingBar from './components/LoadingBar';
import useScrollRestoration from './hooks/useScrollRestoration';
import BreadCrumbsProvider from './contexts/BreadCrumbsProvider';

export default function Root() {
  return (
    <>
      <Main />
    </>
  );
}

const queryClient = new QueryClient();
function Main() {
  useScrollRestoration();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <NavigationStateProvider>
            <CartProvider>
              <ModalProvider>
                <LoadingBar />
                <BreadCrumbsProvider>
                  <Outlet />
                </BreadCrumbsProvider>
              </ModalProvider>
            </CartProvider>
          </NavigationStateProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
