import defaultProfilePic from '../assets/profile.svg';
import useUser from '../hooks/useUser.jsx';

export default function ProfilePic(props) {
  const image = useUser((s) => s?.user?.image);
  const profilePic = image || defaultProfilePic;

  const className = props.className ? 'profile-pic-container ' + props.className : 'profile-pic-container';

  return (
    <div {...props} className={className} to='/profile'>
      <img className='profile-pic' src={profilePic} alt='' />
    </div>
  );
}
