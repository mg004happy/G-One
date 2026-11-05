import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';

/**
 * Route guard that checks if the user has the required role.
 * @param {{ role: string | string[], children: React.ReactNode }} props
 */
const RoleRoute = ({ role, children }) => {
  const userRole = useSelector(selectUserRole);

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
