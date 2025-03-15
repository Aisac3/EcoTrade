import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useEcoPoints } from '../contexts/EcoPointsContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, CurrencyDollarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { getPoints, usePoints, addPoints, ecoPoints } = useEcoPoints();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [useAllPoints, setUseAllPoints] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPlasticForm, setShowPlasticForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [plasticDetails, setPlasticDetails] = useState({
    type: 'PET',
    weight: 1
  });
  const [collectedPlasticDetails, setCollectedPlasticDetails] = useState(null);
  const navigate = useNavigate();
  
  const API_BASE_URL = 'http://localhost:8080';

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateEcoPointsEarned = () => {
    return cartItems.reduce((total, item) => {
      const itemPoints = item.ecoPointsReward || 0;
      return total + (itemPoints * item.quantity);
    }, 0);
  };

  const calculatePointsDiscount = () => {
    return cartItems.reduce((total, item) => {
      if (item.redeemedWithPoints) {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };

  // Calculate how much discount can be applied with available points
  const calculateAvailablePointsDiscount = () => {
    if (!useAllPoints) return 0;
    
    // Convert points to dollars (assuming 10 points = ₹1)
    const pointsValue = ecoPoints / 10;
    
    // Don't allow discount to exceed total
    return Math.min(pointsValue, getCartTotal());
  };

  // Get final total after all discounts
  const getFinalTotal = () => {
    const cartTotal = getCartTotal();
    const pointsDiscount = calculateAvailablePointsDiscount();
    return Math.max(0, cartTotal - pointsDiscount);
  };

  // Calculate how many points would be used
  const getPointsToUse = () => {
    if (!useAllPoints) return 0;
    
    const pointsValue = ecoPoints / 10;
    const cartTotal = getCartTotal();
    
    if (pointsValue >= cartTotal) {
      // If we have more points value than cart total, only use what's needed
      return cartTotal * 10;
    } else {
      // Use all available points
      return ecoPoints;
    }
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

  const handleCheckout = async (usePlastic = true) => {
    if (usePlastic) {
      setShowPlasticForm(true);
      return;
    } else {
      setShowPaymentForm(true);
      return;
    }
  };

  const handlePlasticFormSubmit = (e) => {
    e.preventDefault();
    // Store the plastic details and proceed to payment form
    setCollectedPlasticDetails({...plasticDetails});
    setShowPlasticForm(false);
    setShowPaymentForm(true);
  };

  const handlePaymentFormSubmit = (e) => {
    e.preventDefault();
    
    // If we have collected plastic details, submit with those details
    if (collectedPlasticDetails) {
      submitOrder(true, { plasticDetails: collectedPlasticDetails, paymentDetails });
    } else {
      // Otherwise this is a regular checkout without plastic
      submitOrder(false, { paymentDetails });
    }
  };

  const submitOrder = async (usePlastic = true, additionalData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate points to use if useAllPoints is true
      const pointsToUse = useAllPoints ? getPointsToUse() : 0;
      
      // Debug current user
      console.log('Current user when creating order:', currentUser);
      
      // Check if currentUser exists
      if (!currentUser) {
        throw new Error('You must be logged in to place an order');
      }
      
      // Create order in backend
      const orderData = {
        userId: currentUser.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          redeemedWithPoints: item.redeemedWithPoints || false
        })),
        totalAmount: getFinalTotal(),
        ecoPointsEarned: calculateEcoPointsEarned(),
        ecoPointsUsed: pointsToUse,
        usePlastic: usePlastic
      };
      
      // Add plastic details if provided
      if (additionalData.plasticDetails) {
        orderData.plasticDetails = additionalData.plasticDetails;
      }
      
      // Add payment details if provided
      if (additionalData.paymentDetails) {
        orderData.paymentDetails = additionalData.paymentDetails;
      }

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
        console.log('Order response:', response.data);
        
        // Use points if useAllPoints is true
        if (useAllPoints && pointsToUse > 0) {
          usePoints(pointsToUse);
        }
        
        // Add earned EcoPoints to user's account
        const pointsEarned = calculateEcoPointsEarned();
        
        // Add extra points for plastic recycling if applicable
        let extraPoints = 0;
        if (usePlastic && additionalData.plasticDetails) {
          // Calculate points based on plastic weight (10 points per kg)
          extraPoints = Math.round(additionalData.plasticDetails.weight * 10);
          addPoints(extraPoints);
          
          // Show alert about earned points before setting order placed
          alert(`Thank you for recycling! You've earned ${extraPoints} EcoPoints for your contribution.`);
        }
        
        if (pointsEarned > 0) {
          addPoints(pointsEarned);
        }
        
        setOrderId(response.data.id);
        setOrderPlaced(true);
        clearCart();
        
        // Reset forms
        setShowPaymentForm(false);
        setShowPlasticForm(false);
        setCollectedPlasticDetails(null);
      } catch (axiosError) {
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: axiosError.message
        });
        throw axiosError;
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    
    if (formType === 'payment') {
      setPaymentDetails(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (formType === 'plastic') {
      setPlasticDetails(prev => ({
        ...prev,
        [name]: name === 'weight' ? parseFloat(value) : value
      }));
    }
  };

  const handleRedeemPoints = (item) => {
    if (!item.ecoPointsCost || item.ecoPointsCost <= 0) {
      return;
    }
    
    const currentPoints = getPoints();
    if (currentPoints < item.ecoPointsCost) {
      alert(`You don't have enough EcoPoints. You need ${item.ecoPointsCost} points but have ${currentPoints}.`);
      return;
    }
    
    // Confirm the redemption with the user
    const confirmRedeem = window.confirm(
      `Are you sure you want to redeem ${item.ecoPointsCost} EcoPoints for ${item.name}?\n\n` +
      `This will save you ₹${(item.price * item.quantity).toFixed(2)}\n\n` +
      `Your current balance: ${currentPoints} EcoPoints\n` +
      `Balance after redemption: ${currentPoints - item.ecoPointsCost} EcoPoints`
    );
    
    if (!confirmRedeem) {
      return;
    }
    
    const success = usePoints(item.ecoPointsCost);
    if (success) {
      // Mark item as redeemed with points
      updateQuantity(item.id, item.quantity, true);
      alert(`Successfully redeemed ${item.ecoPointsCost} EcoPoints for ${item.name}!\nYou saved ₹${(item.price * item.quantity).toFixed(2)}`);
    } else {
      alert('Failed to redeem EcoPoints. Please try again.');
    }
  };

  // If order was placed successfully
  if (orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Thank you for your order. Your order ID is <span className="font-medium">{orderId}</span>.
          </p>
          {calculateEcoPointsEarned() > 0 && (
            <p className="mt-2 text-lg text-primary-600">
              You earned {calculateEcoPointsEarned()} EcoPoints with this purchase!
            </p>
          )}
          <div className="mt-8">
            <button
              onClick={() => navigate('/shop')}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h1>
          <p className="mt-4 text-lg text-gray-600">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/shop')}
              className="btn btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-green-900 mb-8">Shopping Cart</h1>
      
      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-black mb-4">Shipping & Payment Details</h2>
            {collectedPlasticDetails && (
              <div className="mb-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm font-medium text-black">
                  You're recycling {collectedPlasticDetails.weight}kg of {collectedPlasticDetails.type} plastic.
                  You'll earn approximately {Math.round(collectedPlasticDetails.weight * 10)} EcoPoints.
                </p>
              </div>
            )}
            <form onSubmit={handlePaymentFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={paymentDetails.name}
                    onChange={(e) => handleInputChange(e, 'payment')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={paymentDetails.address}
                    onChange={(e) => handleInputChange(e, 'payment')}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={paymentDetails.city}
                      onChange={(e) => handleInputChange(e, 'payment')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={paymentDetails.state}
                      onChange={(e) => handleInputChange(e, 'payment')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">PIN Code</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    value={paymentDetails.pincode}
                    onChange={(e) => handleInputChange(e, 'payment')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="cod"
                        name="paymentMethod"
                        type="radio"
                        value="cod"
                        checked={paymentDetails.paymentMethod === 'cod'}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="upi"
                        name="paymentMethod"
                        type="radio"
                        value="upi"
                        checked={paymentDetails.paymentMethod === 'upi'}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="upi" className="ml-3 block text-sm font-medium text-gray-700">
                        UPI
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Plastic Form Modal */}
      {showPlasticForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-black mb-4">Plastic Recycling Details</h2>
            <p className="text-sm text-black mb-4">
              Please provide details about the plastic you're recycling to earn additional EcoPoints.
            </p>
            
            {/* Recycling Guidelines Section */}
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <h3 className="font-medium text-green-900 mb-2">Recycling Guidelines</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-green-900">How to Prepare Your Plastics</h4>
                  <ul className="mt-1 list-disc pl-5 text-sm text-green-800 space-y-1">
                    <li>Rinse containers to remove food residue</li>
                    <li>Remove caps and lids (these can be recycled separately)</li>
                    <li>Flatten bottles to save space</li>
                    <li>Sort plastics by type using the recycling codes</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-green-900">Accepted Plastic Types</h4>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center p-2 bg-green-100 rounded">
                      <div className="w-6 h-6 flex items-center justify-center bg-green-200 text-green-800 rounded-full mr-2 text-xs font-bold">
                        PET
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">Polyethylene Terephthalate</p>
                        <p className="text-xs text-green-700">10 points/kg</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded">
                      <div className="w-6 h-6 flex items-center justify-center bg-green-200 text-green-800 rounded-full mr-2 text-xs font-bold">
                        HDPE
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">High-Density Polyethylene</p>
                        <p className="text-xs text-green-700">8 points/kg</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded">
                      <div className="w-6 h-6 flex items-center justify-center bg-green-200 text-green-800 rounded-full mr-2 text-xs font-bold">
                        PVC
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">Polyvinyl Chloride</p>
                        <p className="text-xs text-green-700">6 points/kg</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded">
                      <div className="w-6 h-6 flex items-center justify-center bg-green-200 text-green-800 rounded-full mr-2 text-xs font-bold">
                        LDPE
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-800">Low-Density Polyethylene</p>
                        <p className="text-xs text-green-700">7 points/kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handlePlasticFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-black">Plastic Type</label>
                  <select
                    id="type"
                    name="type"
                    value={plasticDetails.type}
                    onChange={(e) => handleInputChange(e, 'plastic')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 text-black"
                  >
                    <option value="PET" className="text-black">PET (Polyethylene Terephthalate)</option>
                    <option value="HDPE" className="text-black">HDPE (High-Density Polyethylene)</option>
                    <option value="PVC" className="text-black">PVC (Polyvinyl Chloride)</option>
                    <option value="LDPE" className="text-black">LDPE (Low-Density Polyethylene)</option>
                    <option value="PP" className="text-black">PP (Polypropylene)</option>
                    <option value="PS" className="text-black">PS (Polystyrene)</option>
                    <option value="OTHER" className="text-black">Other Plastics</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-black">
                    Approximate Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    min="0.1"
                    step="0.1"
                    required
                    value={plasticDetails.weight}
                    onChange={(e) => handleInputChange(e, 'plastic')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 text-black"
                  />
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-black">
                    You'll earn approximately {Math.round(plasticDetails.weight * 10)} EcoPoints for recycling this plastic.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPlasticForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Continue to Shipping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Available EcoPoints Display */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Available EcoPoints</p>
              <p className="text-xs text-gray-500">Use your points to get discounts on eligible products</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{ecoPoints} points <span className="text-sm font-normal text-gray-500">(≈ ₹{(ecoPoints / 10).toFixed(2)} value)</span></div>
        </div>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          {cartItems.map((item) => (
            <div key={item.id} className="flex py-6 border-b border-gray-200">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.appendChild(
                      document.createRange().createContextualFragment(
                        `<div class="h-full w-full flex items-center justify-center bg-green-200 text-green-500">
                          <div class="flex flex-col items-center justify-center">
                            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg font-bold">
                              ${item.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                            </div>
                          </div>
                        </div>`
                      )
                    );
                  }}
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-white">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="ml-4 text-lg font-bold">
                      {item.redeemedWithPoints ? (
                        <div>
                          <span className="text-green-600">{item.ecoPointsCost} EcoPoints <span className="text-xs text-gray-500">(≈ ₹{(item.ecoPointsCost / 10).toFixed(2)})</span></span>
                          <div className="text-xs text-gray-500 line-through">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ) : (
                        <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  {item.ecoPointsReward > 0 && (
                    <p className="mt-1 text-sm text-green-600">
                      Earn {item.ecoPointsReward} EcoPoints per item <span className="text-xs text-gray-500">(≈ ₹{(item.ecoPointsReward / 10).toFixed(2)} value)</span>
                    </p>
                  )}
                </div>
                
                <div className="flex flex-1 items-end justify-between text-sm mt-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700 font-medium">
                      Qty
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.redeemedWithPoints)}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-black text-sm rounded-l-md"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 bg-gray-600 text-white font-semibold text-sm min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.redeemedWithPoints)}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-black text-sm rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="font-medium text-red-600 hover:text-red-500 flex items-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-lg bg-white px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow border border-green-100">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</p>
              <p className="text-sm font-medium text-gray-900">₹{calculateSubtotal().toFixed(2)}</p>
            </div>
            
            {calculatePointsDiscount() > 0 && (
              <div className="flex items-center justify-between text-green-600 bg-green-50 p-2 rounded">
                <div>
                  <p className="text-sm font-medium">EcoPoints Discount</p>
                  <p className="text-xs">Points redeemed for free items</p>
                </div>
                <p className="text-sm font-medium">-₹{calculatePointsDiscount().toFixed(2)}</p>
              </div>
            )}
            
            {/* Use all available points option */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="use-points"
                  checked={useAllPoints}
                  onChange={() => setUseAllPoints(!useAllPoints)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="use-points" className="ml-2 block text-sm text-gray-900">
                  Use my EcoPoints for discount
                </label>
              </div>
              
              {useAllPoints && (
                <div className="flex items-center justify-between text-green-600 mt-2">
                  <div>
                    <p className="text-sm font-medium">EcoPoints Applied</p>
                    <p className="text-xs">{getPointsToUse()} points</p>
                  </div>
                  <p className="text-sm font-medium">-₹{calculateAvailablePointsDiscount().toFixed(2)}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                <p>Exchange rate: 10 EcoPoints = ₹1.00</p>
                <p>Available: {ecoPoints} points (≈ ₹{(ecoPoints / 10).toFixed(2)} value)</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-base font-medium text-gray-900">Order total</p>
              <p className="text-base font-medium text-gray-900">₹{getFinalTotal().toFixed(2)}</p>
            </div>
            
            {calculateEcoPointsEarned() > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-green-600 bg-green-50 p-2 rounded mt-2">
                <div>
                  <p className="text-base font-medium">EcoPoints you'll earn</p>
                  <p className="text-xs">Added to your account after purchase</p>
                </div>
                <p className="text-base font-medium">{calculateEcoPointsEarned()} points <span className="text-xs text-gray-500">(≈ ₹{(calculateEcoPointsEarned() / 10).toFixed(2)})</span></p>
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              <p>Your current balance: <span className="font-medium text-green-600">{ecoPoints} EcoPoints</span></p>
              <p>After this purchase: <span className="font-medium text-green-600">{ecoPoints - (useAllPoints ? getPointsToUse() : 0) + calculateEcoPointsEarned()} EcoPoints</span></p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleCheckout(true)}
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center"
            >
              {loading ? 'Processing...' : (
                <>
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Checkout With Plastic
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => handleCheckout(false)}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md flex items-center justify-center"
            >
              {loading ? 'Processing...' : (
                <>
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Checkout Without Plastic
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              or{' '}
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="font-medium text-green-600 hover:text-green-500"
              >
                Continue Shopping
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 