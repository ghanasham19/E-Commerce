import { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  // Load initial wishlist from local storage
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('threadvibe_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('threadvibe_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const isLiked = prev.some((item) => item.id === product.id);
      if (isLiked) {
        return prev.filter((item) => item.id !== product.id); // Remove if already liked
      } else {
        return [...prev, product]; // Add if not liked
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};