import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [activeTab, setActiveTab] = useState('all'); // Only 'all' tab now
  const { addToCart } = useCart();
  
  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const productsResponse = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(productsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine which products to display - always show all products now
  const displayProducts = products;

  // Extract unique categories from products and add custom categories
  const categories = ['all', 'INDOOR', 'OUTDOOR', 'FLOWERING', 'LOW_MAINTENANCE', 'ACCESSORIES', 'FERTILIZERS'];

  // Filter products based on category and search query
  const filteredProducts = displayProducts
    .filter(product => 
      (selectedCategory === 'all' || 
       (selectedCategory === 'INDOOR' && product.category === 'PLANTS' && product.description.toLowerCase().includes('indoor')) ||
       (selectedCategory === 'OUTDOOR' && product.category === 'PLANTS' && product.description.toLowerCase().includes('outdoor')) ||
       (selectedCategory === 'FLOWERING' && product.category === 'PLANTS' && product.description.toLowerCase().includes('flower')) ||
       (selectedCategory === 'LOW_MAINTENANCE' && product.category === 'PLANTS' && 
        (product.description.toLowerCase().includes('low maintenance') || 
         product.description.toLowerCase().includes('low-maintenance'))) ||
       (selectedCategory === product.category)) &&
      (searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-a-z':
          return a.name.localeCompare(b.name);
        case 'name-z-a':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      ecoPointsCost: product.ecoPointsCost || 0,
      ecoPointsReward: product.ecoPointsReward || 0,
      quantity: 1,
      redeemedWithPoints: false
    });
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl) => {
    console.log('Original imageUrl:', imageUrl);
    
    if (!imageUrl) {
      console.log('No image URL provided');
      return null;
    }
    
    // Check if it's an external URL (starts with http or https)
    if (imageUrl.startsWith('http')) {
      console.log('External URL detected, returning null');
      return null;
    }
    
    // For local paths, prepend the API base URL
    // Make sure the path starts with a slash
    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${API_BASE_URL}${normalizedPath}`;
    console.log('Full image URL:', fullUrl);
    return fullUrl;
  };

  // Function to render a placeholder for missing images
  const renderPlaceholder = (productName) => {
    const text = productName || 'No Image';
    const initials = text.split(' ').map(word => word[0]).join('').toUpperCase();
    
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
            {initials}
          </div>
          <p className="mt-2 text-sm">No Image Available</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Eco-Friendly Shop</h1>
      </div>

      {/* Tabs - Remove Plants tab, only keep All Products */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className="py-4 px-1 border-b-2 font-medium text-sm border-primary-500 text-primary-600"
          >
            All Products
          </button>
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input text-black"
              style={{ color: 'black' }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input text-black"
              style={{ color: 'black' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input text-black"
              style={{ color: 'black' }}
            >
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="card group hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-lg bg-gray-200 mb-3">
              {getImageUrl(product.imageUrl) ? (
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                  onLoad={() => console.log('Image loaded successfully:', product.imageUrl)}
                  onError={(e) => {
                    console.error('Image failed to load:', product.imageUrl);
                    console.error('Full URL that failed:', e.target.src);
                    e.target.onerror = null;
                    // Replace with placeholder div instead of setting src
                    e.target.style.display = 'none';
                    e.target.parentNode.appendChild(
                      document.createRange().createContextualFragment(
                        `<div class="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                          <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                              ${product.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                            </div>
                            <p class="mt-2 text-sm">No Image Available</p>
                          </div>
                        </div>`
                      )
                    );
                  }}
                />
              ) : (
                renderPlaceholder(product.name)
              )}
            </div>
            <div className="flex flex-col h-auto">
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                
                {/* Product Details */}
                <div className="mb-3">
                  {product.stock > 0 ? (
                    <p className="text-sm text-green-600 font-medium">In Stock: {product.stock} available</p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary-600">₹{product.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="btn btn-primary px-6 py-2 rounded-full"
                  disabled={product.stock <= 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 