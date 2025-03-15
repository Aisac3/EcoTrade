import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import PlantGrowth from './pages/PlantGrowth';
import Community from './pages/Community';
import AdminProducts from './pages/AdminProducts';
import DevTools from './components/DevTools';
import { CartProvider } from './contexts/CartContext';
import { EcoPointsProvider } from './contexts/EcoPointsContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <EcoPointsProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow w-full">
                <div className="w-full px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/plant-growth" element={<PlantGrowth />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                  </Routes>
                </div>
              </main>
              <Footer />
              <DevTools />
            </div>
          </EcoPointsProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
