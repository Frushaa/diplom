import { useAppSelector } from '../../store/store';

const ClientProfile = () => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div className="profile-container">
      <h1>Профиль клиента</h1>
      <div className="profile-info">
        <p>Имя: {user?.username}</p>
        <p>Email: {user?.email}</p>
      </div>
    </div>
  );
};

export default ClientProfile;