import { useState, useEffect } from 'react';
import { useEcoPoints } from '../contexts/EcoPointsContext';
import axios from 'axios';

export default function Recycling() {
  const [weight, setWeight] = useState('');
  const [type, setType] = useState('PET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [notes, setNotes] = useState('');
  const { addPoints } = useEcoPoints();
  
  const API_BASE_URL = 'http://localhost:8080';

  const plasticTypes = [
    { id: 'PET', name: 'PET (Polyethylene Terephthalate)', pointsPerKg: 10 },
    { id: 'HDPE', name: 'HDPE (High-Density Polyethylene)', pointsPerKg: 8 },
    { id: 'PVC', name: 'PVC (Polyvinyl Chloride)', pointsPerKg: 6 },
    { id: 'LDPE', name: 'LDPE (Low-Density Polyethylene)', pointsPerKg: 7 },
    { id: 'PP', name: 'PP (Polypropylene)', pointsPerKg: 9 },
    { id: 'OTHER', name: 'Other Plastics', pointsPerKg: 5 },
  ];

  // Fetch user's previous submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // In a real app, you would use the actual user ID
        const userId = 1; // Assuming user ID 1 for demo
        const response = await axios.get(`${API_BASE_URL}/api/plastic-submissions/user/${userId}`);
        setSubmissions(response.data);
        setLoadingSubmissions(false);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      setLoading(false);
      return;
    }

    try {
      // Calculate points based on weight and type
      const selectedType = plasticTypes.find(t => t.id === type);
      const pointsEarned = Math.round(parseFloat(weight) * selectedType.pointsPerKg);

      // Create submission data
      const submissionData = {
        userId: 1, // Assuming user ID 1 for demo
        weight: parseFloat(weight),
        plasticType: type,
        ecoPointsEarned: pointsEarned,
        notes: notes,
        submissionDate: new Date().toISOString()
      };

      // Send to backend
      await axios.post(`${API_BASE_URL}/api/plastic-submissions`, submissionData);
      
      // Add points to user's account
      addPoints(pointsEarned);
      
      // Reset form
      setWeight('');
      setNotes('');
      setSuccess(true);
      
      // Show success message
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to submit recycling:', err);
      setError('Failed to submit recycling. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Recycling Center</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Recycling Form */}
        <div className="lg:col-span-7">
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Your Recycling</h2>
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
                Recycling submitted successfully! You earned points for your contribution.
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    step="0.1"
                    min="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Enter weight in kilograms"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Plastic Type
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  >
                    {plasticTypes.map((plasticType) => (
                      <option key={plasticType.id} value={plasticType.id}>
                        {plasticType.name} ({plasticType.pointsPerKg} points/kg)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Any additional information about your recycling"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Submit Recycling'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recycling Guidelines</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">How to Prepare Your Plastics</h3>
                <ul className="mt-2 list-disc pl-5 text-gray-600 space-y-1">
                  <li>Rinse containers to remove food residue</li>
                  <li>Remove caps and lids (these can be recycled separately)</li>
                  <li>Flatten bottles to save space</li>
                  <li>Sort plastics by type using the recycling codes</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Accepted Plastic Types</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plasticTypes.map((plasticType) => (
                    <div key={plasticType.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-800 rounded-full mr-2">
                        {plasticType.id}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{plasticType.name.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">{plasticType.pointsPerKg} points/kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submission History */}
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Recycling History</h2>
            
            {loadingSubmissions ? (
              <div className="py-8 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>You haven't submitted any recycling yet.</p>
                <p className="mt-2 text-sm">Start recycling today to earn EcoPoints!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{submission.plasticType} Plastic</p>
                        <p className="text-sm text-gray-500">{formatDate(submission.submissionDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{submission.weight} kg</p>
                        <p className="text-sm text-primary-600">+{submission.ecoPointsEarned} points</p>
                      </div>
                    </div>
                    {submission.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">"{submission.notes}"</p>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total Recycled</p>
                    <p className="font-medium">
                      {submissions.reduce((total, sub) => total + sub.weight, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="font-medium text-primary-600">Total Points Earned</p>
                    <p className="font-medium text-primary-600">
                      {submissions.reduce((total, sub) => total + sub.ecoPointsEarned, 0)} points
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 