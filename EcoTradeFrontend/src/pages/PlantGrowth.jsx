import { useState, useEffect } from 'react';
import axios from 'axios';
import { useEcoPoints } from '../contexts/EcoPointsContext';
import { useAuth } from '../contexts/AuthContext';

export default function PlantGrowth() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState('water');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [plantHeight, setPlantHeight] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { addPoints } = useEcoPoints();
  const { currentUser, isAdmin } = useAuth();
  
  const API_BASE_URL = 'http://localhost:8080';

  // Function to show notification popup
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Set the selected user ID when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser]);

  // Only fetch users if the current user is an admin
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users`);
          setUsers(response.data);
          setLoadingUsers(false);
        } catch (err) {
          console.error('Failed to fetch users:', err);
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdmin]);

  // Fetch plants when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      const fetchPlants = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/plants/user/${selectedUserId}`);
          setPlants(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Failed to fetch plants:', err);
          setError('Failed to fetch plants. Please try again later.');
          setLoading(false);
        }
      };

      fetchPlants();
    }
  }, [selectedUserId]);

  // Fetch plants from orders when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      const fetchPlantsFromOrders = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/plants/user/${selectedUserId}/orders`);
          
          // If we got plants from orders, add them to the existing plants
          if (response.data && response.data.length > 0) {
            setPlants(prevPlants => {
              // Create a Map to store unique plants by ID
              const plantsMap = new Map();
              
              // Add existing plants to the map
              prevPlants.forEach(plant => {
                plantsMap.set(plant.id, plant);
              });
              
              // Add plants from orders, overwriting if they already exist
              response.data.forEach(plant => {
                plantsMap.set(plant.id, plant);
              });
              
              // Convert the map values back to an array
              return Array.from(plantsMap.values());
            });
          }
        } catch (err) {
          console.error('Failed to fetch plants from orders:', err);
        }
      };

      fetchPlantsFromOrders();
    }
  }, [selectedUserId]);

  // Handle user change (only for admins)
  const handleUserChange = (e) => {
    setSelectedUserId(Number(e.target.value));
  };

  // Notification component
  const NotificationPopup = () => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'success' ? 'bg-green-100 border-green-500' : 
                    notification.type === 'error' ? 'bg-red-100 border-red-500' : 
                    'bg-blue-100 border-blue-500';
    
    const textColor = notification.type === 'success' ? 'text-green-800' : 
                      notification.type === 'error' ? 'text-red-800' : 
                      'text-blue-800';
    
    return (
      <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border-l-4 ${bgColor} max-w-md z-50`}>
        <div className="flex items-start">
          <div className={`mr-3 ${textColor}`}>
            {notification.type === 'success' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className={`font-medium ${textColor}`}>{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const handleWaterPlant = async (plantId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/plants/${plantId}/water`);
      
      // Update local state with the response data
      setPlants(plants.map(plant => 
        plant.id === plantId ? response.data : plant
      ));
      
      // Show success message
      showNotification('Plant watered successfully! Check back in a week to water again for bonus EcoPoints.', 'success');
    } catch (err) {
      console.error('Failed to water plant:', err);
      showNotification('Failed to water plant. Please try again.', 'error');
    }
  };

  const handleFertilizePlant = async (plantId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/plants/${plantId}/fertilize`);
      
      // Update local state with the response data
      setPlants(plants.map(plant => 
        plant.id === plantId ? response.data : plant
      ));
      
      // Show success message
      showNotification('Plant fertilized successfully! Check back in a month to fertilize again for bonus EcoPoints.', 'success');
    } catch (err) {
      console.error('Failed to fertilize plant:', err);
      showNotification('Failed to fertilize plant. Please try again.', 'error');
    }
  };

  const handleRecordMaintenance = async (plantId) => {
    try {
      // Create the request body with height if provided
      const requestBody = {};
      if (plantHeight && !isNaN(parseFloat(plantHeight))) {
        requestBody.currentHeightCm = parseFloat(plantHeight);
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/api/plants/${plantId}/record-maintenance`,
        requestBody,
        {
          params: {
            maintenanceType,
            notes: maintenanceNotes
          }
        }
      );
      
      // Update local state with the response data
      setPlants(plants.map(plant => 
        plant.id === plantId ? response.data : plant
      ));
      
      // Close the modal
      setShowMaintenanceModal(false);
      setSelectedPlant(null);
      setMaintenanceNotes('');
      setPlantHeight('');
      
      // Show success message
      showNotification(`Maintenance (${maintenanceType}) recorded successfully! You've earned EcoPoints for taking care of your plant.`, 'success');
    } catch (err) {
      console.error('Failed to record maintenance:', err);
      showNotification('Failed to record maintenance. Please try again.', 'error');
    }
  };

  const openMaintenanceModal = (plant) => {
    setSelectedPlant(plant);
    setPlantHeight(plant.currentHeightCm ? plant.currentHeightCm.toString() : '');
    setShowMaintenanceModal(true);
  };
  
  const handleDeletePlant = async (plantId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/plants/${plantId}`);
      
      // Remove the plant from the local state
      setPlants(plants.filter(plant => plant.id !== plantId));
      
      // Close the confirmation dialog
      setDeleteConfirmation(false);
      setPlantToDelete(null);
      
      // Show success message
      showNotification('Plant deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete plant:', err);
      showNotification('Failed to delete plant. Please try again.', 'error');
    }
  };
  
  const openDeleteConfirmation = (plant) => {
    setPlantToDelete(plant);
    setDeleteConfirmation(true);
  };
  
  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return null;
    }
    
    // Check if it's an external URL (starts with http or https)
    if (imageUrl.startsWith('http')) {
      // For external URLs, use a local placeholder instead
      return null;
    }
    
    // For local paths, prepend the API base URL
    // Make sure the path starts with a slash
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };

  // Helper function to calculate days since last watering
  const getDaysSinceLastWatering = (plant) => {
    if (!plant.lastWatered) return null;
    
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const diffTime = Math.abs(today - lastWatered);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to calculate days since last fertilizing
  const getDaysSinceLastFertilizing = (plant) => {
    if (!plant.lastFertilized) return null;
    
    const lastFertilized = new Date(plant.lastFertilized);
    const today = new Date();
    const diffTime = Math.abs(today - lastFertilized);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to get watering status
  const getWateringStatus = (plant) => {
    const days = getDaysSinceLastWatering(plant);
    
    if (days === null) return { text: 'Never watered', color: 'text-red-600' };
    if (days < 5) return { text: 'Recently watered', color: 'text-green-600' };
    if (days >= 5 && days <= 9) return { text: 'Ready for watering (bonus EcoPoints)', color: 'text-blue-600' };
    return { text: 'Needs watering urgently', color: 'text-red-600' };
  };

  // Helper function to get fertilizing status
  const getFertilizingStatus = (plant) => {
    const days = getDaysSinceLastFertilizing(plant);
    
    if (days === null) return { text: 'Never fertilized', color: 'text-red-600' };
    if (days < 25) return { text: 'Recently fertilized', color: 'text-green-600' };
    if (days >= 25 && days <= 35) return { text: 'Ready for fertilizing (bonus EcoPoints)', color: 'text-blue-600' };
    return { text: 'Needs fertilizing', color: 'text-yellow-600' };
  };

  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-12">
      <p className="text-red-600">{error}</p>
    </div>
  );

  const renderMaintenanceModal = () => {
    if (!selectedPlant) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Record Maintenance for {selectedPlant.name}</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
            >
              <option value="water" className="text-black">Water</option>
              <option value="fertilize" className="text-black">Fertilize</option>
              <option value="prune" className="text-black">Prune</option>
              <option value="repot" className="text-black">Repot</option>
              <option value="other" className="text-black">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Height (cm)</label>
            <input
              type="number"
              value={plantHeight}
              onChange={(e) => setPlantHeight(e.target.value)}
              step="0.1"
              min="0"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
              placeholder="Enter current height in centimeters"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              rows="3"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
              placeholder="Add any notes about this maintenance activity..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowMaintenanceModal(false);
                setSelectedPlant(null);
                setMaintenanceNotes('');
                setPlantHeight('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleRecordMaintenance(selectedPlant.id)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Record Maintenance
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!plantToDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Delete Plant</h2>
          
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete <span className="font-medium">{plantToDelete.name}</span>? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation(false);
                setPlantToDelete(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeletePlant(plantToDelete.id)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Plant
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPlants = () => {
    if (loadingUsers || loading) return renderLoading();
    if (error) return renderError();
    if (!currentUser) return <div className="text-center py-12"><p className="text-red-600">Please log in to view your plants.</p></div>;

    return (
      <div>
        {/* User Selection Dropdown (Admin Only) */}
        {isAdmin && (
          <div className="mb-6">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select User
            </label>
            <div className="flex items-center">
              <select
                id="user-select"
                value={selectedUserId || ''}
                onChange={handleUserChange}
                className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-black"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.username})
                  </option>
                ))}
              </select>
              <span className="ml-3 text-sm text-gray-500">
                Viewing plants for selected user
              </span>
            </div>
          </div>
        )}

        {/* Current User's Plants Header */}
        {!isAdmin && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white-900">
              My Plants
            </h2>
            <p className="text-sm text-gray-500">
              Track and manage your plant collection from orders
            </p>
          </div>
        )}

        {plants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {isAdmin ? "This user hasn't ordered any plants yet." : "You haven't ordered any plants yet."}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Plants are automatically added here when you purchase them from the store.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map(plant => {
              const wateringStatus = getWateringStatus(plant);
              const fertilizingStatus = getFertilizingStatus(plant);
              
              return (
                <div key={plant.id} className="card border border-gray-200 rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                    <img
                      src={getImageUrl(plant.imageUrl)}
                      alt={plant.name}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.appendChild(
                          document.createRange().createContextualFragment(
                            `<div class="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                              <div class="flex flex-col items-center justify-center">
                                <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                                  ${plant.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                                </div>
                                <p class="mt-2 text-sm">Plant Image</p>
                              </div>
                            </div>`
                          )
                        );
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{plant.name}</h3>
                        <p className="text-sm text-gray-500">{plant.species || plant.description}</p>
                        
                        {/* Plant ID and Purchase/Planting Date */}
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            ID: {plant.id}
                          </span>
                          {plant.purchaseDate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Ordered: {new Date(plant.purchaseDate).toLocaleDateString()}
                            </span>
                          )}
                          {plant.plantingDate && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Planted: {new Date(plant.plantingDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Owner Information (Admin Only) */}
                        {isAdmin && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Owner: {plant.userName}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {plant.growthStage}
                      </span>
                    </div>
                    
                    {/* Plant Height */}
                    {plant.currentHeightCm && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Current Height: <span className="font-medium">{plant.currentHeightCm} cm</span>
                        </p>
                      </div>
                    )}
                    
                    {/* Growth Progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Growth Progress</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 h-2.5 rounded-full"
                          style={{ width: plant.growthStage === 'Seedling' ? '25%' : 
                                         plant.growthStage === 'Young Plant' ? '50%' : 
                                         plant.growthStage === 'Mature Plant' ? '75%' : '100%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Health Status */}
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Health</span>
                        <span>{plant.healthStatus}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            plant.healthStatus === 'Good'
                              ? 'bg-green-500'
                              : plant.healthStatus === 'Fair'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: plant.healthStatus === 'Good' ? '100%' : 
                                         plant.healthStatus === 'Fair' ? '60%' : '30%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Maintenance Status */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Watering:</span>
                        <span className={`text-sm font-medium ${wateringStatus.color}`}>
                          {wateringStatus.text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fertilizing:</span>
                        <span className={`text-sm font-medium ${fertilizingStatus.color}`}>
                          {fertilizingStatus.text}
                        </span>
                      </div>
                    </div>

                    {/* Care Instructions */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800">Care Instructions:</h4>
                      <ul className="mt-1 text-xs text-blue-700 list-disc list-inside">
                        <li>Water every 7 days (5-9 days for bonus points)</li>
                        <li>Fertilize once a month (25-35 days for bonus points)</li>
                        <li>Place in {plant.name.includes('Snake') ? 'indirect' : 'bright'} sunlight</li>
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleWaterPlant(plant.id)}
                        className="btn btn-sm btn-primary"
                        disabled={getDaysSinceLastWatering(plant) !== null && getDaysSinceLastWatering(plant) < 3}
                      >
                        Water Plant
                      </button>
                      <button
                        onClick={() => handleFertilizePlant(plant.id)}
                        className="btn btn-sm btn-secondary"
                        disabled={getDaysSinceLastFertilizing(plant) !== null && getDaysSinceLastFertilizing(plant) < 20}
                      >
                        Fertilize
                      </button>
                      <button
                        onClick={() => openMaintenanceModal(plant)}
                        className="btn btn-sm btn-outline"
                      >
                        Record Maintenance
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(plant)}
                        className="btn btn-sm btn-outline text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Plant Growth Tracker</h1>
      </div>

      {/* Content */}
      <div>
        {renderPlants()}
      </div>
      
      {/* Maintenance Modal */}
      {showMaintenanceModal && renderMaintenanceModal()}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && renderDeleteConfirmation()}
      
      {/* Notification Popup */}
      <NotificationPopup />
    </div>
  );
} 