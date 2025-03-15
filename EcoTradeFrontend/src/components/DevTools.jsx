import { useAuth } from '../contexts/AuthContext';

export default function DevTools() {
  const { currentUser } = useAuth();

  // Return null instead of rendering user details
  return null;
} 