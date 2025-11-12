import Navbar from './Navbar';
import { Outlet, useMatches } from 'react-router';
import CustomToaster from './CustomToaster';
import QuickNavBar from './QuickNavBar';

export default function MainPage() {
  return (
    <>
      <Navbar />
      <QuickNavBar />
      <main>
        <Outlet />
      </main>
      <CustomToaster />
    </>
  );
}
