const { useState, useEffect } = require('react');
const { collection, query, orderBy, limit, onSnapshot } = require('firebase/firestore');
const { db } = require('../firebase/firebaseConfig');

const useCartOrders = (cartId, max = 50) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!cartId) { setLoading(false); return; }
    const q = query(
      collection(db, 'carts', cartId, 'orders'),
      orderBy('createdAt', 'desc'), limit(max)
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [cartId]);
  return { orders, loading };
};

const useAllCarts = () => {
  const [carts,   setCarts]   = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'carts'), snap => {
      setCarts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);
  return { carts, loading };
};

const useDashboardStats = (carts) => {
  const [stats, setStats] = useState({ totalToday: 0, totalOrders: 0, avgBasket: 0 });
  useEffect(() => {
    if (!carts || carts.length === 0) return;
    const today = new Date().toLocaleDateString('fr-FR');
    let all = [];
    carts.forEach(cart => {
      const q = query(collection(db, 'carts', cart.id, 'orders'), orderBy('createdAt', 'desc'), limit(200));
      onSnapshot(q, snap => {
        const co = snap.docs.map(d => d.data()).filter(o => o.date === today);
        all = [...all.filter(o => o._cid !== cart.id), ...co.map(o => ({ ...o, _cid: cart.id }))];
        const totalToday  = all.reduce((s, o) => s + (o.total || 0), 0);
        const totalOrders = all.length;
        const avgBasket   = totalOrders > 0 ? Math.round(totalToday / totalOrders) : 0;
        setStats({ totalToday, totalOrders, avgBasket });
      });
    });
  }, [carts]);
  return stats;
};

module.exports = { useCartOrders, useAllCarts, useDashboardStats };
