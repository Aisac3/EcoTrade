import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // Load cart items from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        console.log('Cart saved to localStorage:', cartItems);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, initialized]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        const updatedItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
        return updatedItems;
      }
      const newItems = [...prevItems, { ...item, quantity: 1 }];
      return newItems;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity, redeemedWithPoints) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId 
          ? { 
              ...item, 
              quantity: Math.max(1, quantity),
              redeemedWithPoints: redeemedWithPoints !== undefined ? redeemedWithPoints : item.redeemedWithPoints
            } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Skip items redeemed with points when calculating total
      if (item.redeemedWithPoints) {
        return total;
      }
      return total + item.price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 