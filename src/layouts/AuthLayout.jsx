import { Outlet } from 'react-router-dom';
import './Layout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
};

export default AuthLayout;

