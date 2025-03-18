import { Link } from 'react-router-dom';
import { useEcoPoints } from '../contexts/EcoPointsContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { getPoints } = useEcoPoints();
  const API_BASE_URL = 'http://localhost:8080';

  const [trendingPlants, setTrendingPlants] = useState([
    {
      id: 1,
      name: "Monstera Deliciosa",
      image: "/images/monstera.jpg",
      price: "₹599",
      rating: 4.8,
      category: "Indoor Plants"
    },
    {
      id: 2,
      name: "Snake Plant",
      image: "/images/snake-plant.jpg",
      price: "₹499",
      rating: 4.9,
      category: "Air Purifying"
    },
    {
      id: 3,
      name: "Boston Fern",
      image: "/images/boston-fern.jpg",
      price: "₹449",
      rating: 4.7,
      category: "Hanging Plants"
    }
  ]);

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      console.log('No image URL provided');
      return null;
    }
    
    // If it's an external URL, return as is
    if (imageUrl.startsWith('http')) {
      console.log('Using external URL:', imageUrl);
      return imageUrl;
    }

    // Remove any leading 'static' from the path as it's not needed
    const cleanPath = imageUrl.replace(/^\/?(static\/)?/, '');
    const fullUrl = `${API_BASE_URL}/${cleanPath}`;
    console.log('Constructed image URL:', fullUrl);
    return fullUrl;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80" 
            alt="Nature background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight animate-fade-in">
              Sustainable Shopping for a
              <span className="block mt-2 text-primary-200">Better Tomorrow</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-50 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join EcoTrade in making a difference. Shop eco-friendly products, earn EcoPoints, and contribute to a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/shop" 
                className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Shopping
              </Link>
              <Link to="/community" 
                className="px-8 py-4 bg-transparent text-white rounded-full font-semibold text-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Glass Effect */}
      <section className="py-20 bg-gradient-to-b from-primary-900 to-primary-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">
            Why Choose <span className="text-primary-200">EcoTrade</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* EcoPoints Card */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
              <div className="text-primary-200 mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">EcoPoints System</h3>
              <p className="text-primary-100 leading-relaxed">
                Earn points through sustainable actions and redeem them for discounts on eco-friendly products.
              </p>
            </div>

            {/* Plant Growth Card */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
              <div className="text-primary-200 mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Plant Growth Tracking</h3>
              <p className="text-primary-100 leading-relaxed">
                Monitor and care for your purchased plants with our interactive growth tracking system.
              </p>
            </div>

            {/* Recycling Card */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 transform hover:-translate-y-1">
              <div className="text-primary-200 mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Plastic Recycling</h3>
              <p className="text-primary-100 leading-relaxed">
                Contribute to environmental conservation by recycling plastic and earning EcoPoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Plants Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Trending Plant Species
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover our most popular plant varieties that bring both beauty and environmental benefits to your space.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingPlants.map((plant) => (
              <div key={plant.id} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(plant.image)}
                    alt={plant.name}
                    className="h-64 w-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', plant.image);
                      // Create initials from plant name
                      const initials = plant.name
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase();
                      
                      // Replace with a colored div containing initials
                      const parent = e.target.parentNode;
                      const placeholder = document.createElement('div');
                      placeholder.className = 'h-64 w-full flex items-center justify-center bg-primary-100 text-primary-600 text-4xl font-bold';
                      placeholder.innerHTML = initials;
                      parent.appendChild(placeholder);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium px-3 py-1 bg-primary-500 rounded-full">
                      {plant.category}
                    </span>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1">{plant.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{plant.name}</h3>
                  <p className="text-2xl font-bold text-primary-200">{plant.price}</p>
                  <Link 
                    to="/shop" 
                    className="mt-4 inline-block w-full text-center bg-white text-primary-600 px-6 py-2 rounded-full font-semibold hover:bg-primary-50 transition-colors duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMjggNjZMMCA1MEwyOCAzNGwyOCAxNkwyOCA2NnpNMjggMzRMMCA1MEwyOCA2NmwyOC0xNkwyOCAzNHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/10 rounded-3xl shadow-xl p-12 transform hover:scale-[1.02] transition-all duration-300 border border-white/20">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed">
              Start your sustainable journey today and earn EcoPoints while shopping.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/shop" 
                className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Browse Products
              </Link>
              <Link to="/community" 
                className="px-8 py-4 bg-transparent text-white rounded-full font-semibold text-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 