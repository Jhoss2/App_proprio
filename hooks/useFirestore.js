const { useState, useEffect } = require('react');
const {
  collection, query, orderBy, limit,
  onSnapshot, doc, getDocs,
} = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

/**
 * Hook — écoute les commandes d'un cart en temps réel
 */
const useCartOrders = (cartId, maxOrders = 50) => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cartId) return;
    const ref = collection(db, 'carts', cartId, 'orders');
    const q   = query(ref, orderBy('createdAt', 'desc'), limit(maxOrders));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.warn('[Firestore] useCartOrders:', err.message);
      setLoading(false);
    });

    return () => unsub();
  }, [cartId]);

  return { orders, loading };
};

/**
 * Hook — écoute tous les carts connus (liste dans settings globaux)
 */
const useAllCarts = () => {
  const [carts, setCarts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref  = collection(db, 'carts');
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCarts(data);
      setLoading(false);
    }, (err) => {
      console.warn('[Firestore] useAllCarts:', err.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { carts, loading };
};

/**
 * Hook — stats consolidées de tous les carts pour le dashboard
 */
const useDashboardStats = (carts) => {
  const [stats, setStats] = useState({
    totalToday: 0,
    totalOrders: 0,
    avgBasket: 0,
    cartsOnline: 0,
  });

  useEffect(() => {
    if (!carts || carts.length === 0) return;

    const today = new Date().toLocaleDateString('fr-FR');
    let allOrders = [];
    let pending   = carts.length;

    carts.forEach(cart => {
      const ref = collection(db, 'carts', cart.id, 'orders');
      const q   = query(ref, orderBy('createdAt', 'desc'), limit(200));

      onSnapshot(q, (snap) => {
        const cartOrders = snap.docs
          .map(d => d.data())
          .filter(o => o.date === today);

        allOrders = [...allOrders.filter(o => o.cartId !== cart.id), ...cartOrders];

        const totalToday  = allOrders.reduce((s, o) => s + (o.total || 0), 0);
        const totalOrders = allOrders.length;
        const avgBasket   = totalOrders > 0 ? Math.round(totalToday / totalOrders) : 0;

        setStats({ totalToday, totalOrders, avgBasket, cartsOnline: carts.length });
      });
    });
  }, [carts]);

  return stats;
};

module.exports = { useCartOrders, useAllCarts, useDashboardStats };
