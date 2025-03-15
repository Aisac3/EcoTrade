import { Link } from 'react-router-dom';
import { useEcoPoints } from '../contexts/EcoPointsContext';

export default function Home() {
  const { getPoints } = useEcoPoints();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-primary-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sustainable Shopping for a Better Tomorrow
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join EcoTrade in making a difference. Shop eco-friendly products, earn EcoPoints, and contribute to a sustainable future.
            </p>
            <div className="flex space-x-4">
              <Link to="/shop" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose EcoTrade?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-primary-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">EcoPoints System</h3>
            <p className="text-gray-600">
              Earn points through sustainable actions and redeem them for discounts on eco-friendly products.
            </p>
          </div>

          <div className="card">
            <div className="text-primary-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Plant Growth Tracking</h3>
            <p className="text-gray-600">
              Monitor and care for your purchased plants with our interactive growth tracking system.
            </p>
          </div>

          <div className="card">
            <div className="text-primary-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Plastic Recycling</h3>
            <p className="text-gray-600">
              Contribute to environmental conservation by recycling plastic and earning EcoPoints.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-gray-600 font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your sustainable journey today and earn EcoPoints while shopping.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/shop" className="btn btn-primary">
              Browse Products
            </Link>
            <Link to="/community" className="btn btn-secondary">
              Join Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 