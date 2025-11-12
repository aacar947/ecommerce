import logo from '../assets/logo.svg';
import { Link } from 'react-router';

export default function Logo({ size }) {
  return (
    <Link className='logo container-shadow' to='/' style={{ height: `${size}` }}>
      <img src={logo} alt='logo' width={size} height={size} /> <h2>BRAND</h2>
    </Link>
  );
}
