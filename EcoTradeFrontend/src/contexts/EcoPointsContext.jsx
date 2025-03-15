import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const EcoPointsContext = createContext();

export function EcoPointsProvider({ children }) {
  const [ecoPoints, setEcoPoints] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const { currentUser } = useAuth();

  // Load eco points from user or localStorage on initial render
  useEffect(() => {
    try {
      // First priority: use points from current user if available
      if (currentUser && currentUser.ecoPoints !== undefined) {
        console.log('Setting eco points from user:', currentUser.ecoPoints);
        setEcoPoints(currentUser.ecoPoints);
        localStorage.setItem('ecoPoints', currentUser.ecoPoints.toString());
      } else {
        // Fallback to localStorage if no user is logged in
        const savedPoints = localStorage.getItem('ecoPoints');
        if (savedPoints) {
          const points = parseInt(savedPoints);
          if (!isNaN(points)) {
            console.log('Setting eco points from localStorage:', points);
            setEcoPoints(points);
          }
        }
      }
    } catch (error) {
      console.error('Error loading eco points:', error);
    } finally {
      setInitialized(true);
    }
  }, [currentUser]);

  // Save eco points to localStorage whenever they change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem('ecoPoints', ecoPoints.toString());
        console.log('Eco points saved to localStorage:', ecoPoints);
        
        // If we have a current user, update their points in localStorage too
        if (currentUser) {
          const updatedUser = { ...currentUser, ecoPoints };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('Updated user eco points in localStorage:', ecoPoints);
        }
      } catch (error) {
        console.error('Error saving eco points to localStorage:', error);
      }
    }
  }, [ecoPoints, initialized, currentUser]);

  const addPoints = (points) => {
    if (points > 0) {
      setEcoPoints((prev) => prev + points);
    }
  };

  const usePoints = (points) => {
    if (points > 0 && ecoPoints >= points) {
      setEcoPoints((prev) => prev - points);
      return true;
    }
    return false;
  };

  const getPoints = () => {
    return ecoPoints;
  };

  return (
    <EcoPointsContext.Provider
      value={{
        ecoPoints,
        addPoints,
        usePoints,
        getPoints,
      }}
    >
      {children}
    </EcoPointsContext.Provider>
  );
}

export function useEcoPoints() {
  const context = useContext(EcoPointsContext);
  if (!context) {
    throw new Error('useEcoPoints must be used within an EcoPointsProvider');
  }
  return context;
} 