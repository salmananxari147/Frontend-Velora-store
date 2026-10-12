import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const KEY = 'velora_cart';

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState(readCart);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (loading) return undefined;
    if (!user) {
      setReady(true);
      return undefined;
    }
    let cancel = false;
    setReady(false);
    api
      .get('/cart')
      .then(({ data }) => {
        if (cancel) return;
        setItems((current) => (current.length ? current : data.items || []));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, [user, loading]);

  useEffect(() => {
    if (!ready || !user) return undefined;
    const timer = setTimeout(() => {
      api
        .put('/cart', {
          items: items.map(({ product, size, color, qty }) => ({ product, size, color, qty })),
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [items, ready, user]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      items,
      count,
      subtotal,
      addItem(product, { size, color, qty }) {
        setItems((prev) => {
          const index = prev.findIndex(
            (item) => item.product === product._id && item.size === size && item.color === color
          );
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], qty: next[index].qty + qty };
            return next;
          }
          return [
            ...prev,
            {
              product: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] || '',
              price: product.price,
              size,
              color,
              qty,
              stock: product.stock,
            },
          ];
        });
      },
      updateQty(product, size, color, qty) {
        setItems((prev) =>
          prev
            .map((item) =>
              item.product === product && item.size === size && item.color === color ? { ...item, qty } : item
            )
            .filter((item) => item.qty > 0)
        );
      },
      removeItem(product, size, color) {
        setItems((prev) => prev.filter((item) => !(item.product === product && item.size === size && item.color === color)));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
