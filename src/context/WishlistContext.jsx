import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const KEY = 'velora_wishlist';

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function compact(product) {
  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    category: product.category,
    rating: product.rating,
    numReviews: product.numReviews,
    colors: product.colors,
    sizes: product.sizes,
    stock: product.stock,
  };
}

export function WishlistProvider({ children }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (loading || !user) return undefined;
    let cancel = false;
    api
      .get('/users/wishlist')
      .then(({ data }) => {
        if (cancel) return;
        setItems((current) => {
          const map = new Map(current.map((item) => [item._id, item]));
          data.forEach((product) => map.set(product._id, compact(product)));
          return [...map.values()];
        });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [user, loading]);

  const value = useMemo(
    () => ({
      items,
      has(id) {
        return items.some((item) => item._id === id);
      },
      toggle(product) {
        setItems((prev) => {
          const exists = prev.some((item) => item._id === product._id);
          return exists ? prev.filter((item) => item._id !== product._id) : [compact(product), ...prev];
        });
        if (user) api.post(`/users/wishlist/${product._id}`).catch(() => {});
      },
    }),
    [items, user]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
