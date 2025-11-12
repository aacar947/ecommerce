import './styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Root from './root';
import routes from './routes.jsx';
import ErrorBoundry from './routes/errorBoundry';

const router = createBrowserRouter([
  {
    element: (
      <>
        <Root />
      </>
    ),
    children: routes,
    errorElement: <ErrorBoundry />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
