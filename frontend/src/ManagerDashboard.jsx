import { useState, useEffect, useMemo, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './dashboard-theme.css';

const TOKEN_KEY = 'momo_manager_token';
const authHeaders = () => {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Token ${t}` } : {};
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function ManagerDashboard({ onExitToMenu, onMenuUpdated }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(TOKEN_KEY);
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data state
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState(() => window.location.origin);

  // Filters & search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, unavailable

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for add, object for edit
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    has_sizes: false,
    sizes: [{ name: '', price: '' }],
    is_available: true,
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: '🍽️',
    order: 0,
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'item'|'category', id, name }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch all menu items & categories (including unavailable)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE}/categories/`, { headers: authHeaders() }),
        fetch(`${API_BASE}/items/`, { headers: authHeaders() })
      ]);

      if (catsRes.ok && itemsRes.ok) {
        const catsData = await catsRes.json();
        const itemsData = await itemsRes.json();
        setCategories(catsData);
        setItems(itemsData);
      } else {
        throw new Error('فشل جلب البيانات من السيرفر');
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر الاتصال بالخادم، تأكد من تشغيل الباك إند', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok && data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem('momo_manager_user', username);
        setIsAuthenticated(true);
        showToast('مرحباً بك في لوحة تحكم المدير 👋');
      } else {
        setLoginError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setLoginError('تعذر الاتصال بسيرفر الباك إند');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    fetch(`${API_BASE}/auth/logout/`, { method: 'POST', headers: authHeaders() }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('momo_manager_user');
    setIsAuthenticated(false);
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Quick Toggle Item Availability
  const toggleItemAvailability = async (item) => {
    const newStatus = !item.is_available;
    try {
      const res = await fetch(`${API_BASE}/items/${item.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ is_available: newStatus })
      });

      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: newStatus } : i));
        showToast(`تم ${newStatus ? 'تفعيل' : 'إيقاف'} الصنف: "${item.name}"`);
        if (onMenuUpdated) onMenuUpdated();
      } else {
        showToast('فشل تحديث حالة الصنف', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Open Add Item Modal
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      category: categories.length > 0 ? categories[0].id : '',
      description: '',
      price: '',
      has_sizes: false,
      sizes: [
        { name: 'ربع', price: '' },
        { name: 'نص', price: '' },
        { name: 'كيلو', price: '' }
      ],
      is_available: true,
    });
    setItemModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price !== null && item.price !== undefined ? item.price : '',
      has_sizes: Boolean(item.has_sizes),
      sizes: item.sizes && item.sizes.length > 0
        ? item.sizes.map(s => ({ name: s.name, price: s.price }))
        : [{ name: 'صغير', price: '' }, { name: 'كبير', price: '' }],
      is_available: item.is_available,
    });
    setItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) {
      showToast('من فضلك اكتب اسم الصنف', 'error');
      return;
    }
    if (!itemFormData.category) {
      showToast('من فضلك اختر القسم', 'error');
      return;
    }

    const payload = {
      name: itemFormData.name.trim(),
      category: parseInt(itemFormData.category, 10),
      description: itemFormData.description.trim(),
      has_sizes: itemFormData.has_sizes,
      is_available: itemFormData.is_available,
    };

    if (itemFormData.has_sizes) {
      const validSizes = itemFormData.sizes.filter(s => s.name.trim() && s.price !== '');
      if (validSizes.length === 0) {
        showToast('يرجى تحديد حجم واحد على الأقل مع السعر', 'error');
        return;
      }
      payload.sizes = validSizes.map((s, idx) => ({
        name: s.name.trim(),
        price: parseFloat(s.price),
        order: idx
      }));
      payload.price = validSizes[0].price;
    } else {
      if (itemFormData.price === '' || isNaN(parseFloat(itemFormData.price))) {
        showToast('من فضلك حدد سعر الصنف', 'error');
        return;
      }
      payload.price = parseFloat(itemFormData.price);
      payload.sizes = [];
    }

    try {
      const url = editingItem
        ? `${API_BASE}/items/${editingItem.id}/`
        : `${API_BASE}/items/`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingItem ? 'تم تعديل الصنف بنجاح ✅' : 'تمت إضافة الصنف بنجاح 🎉');
        setItemModalOpen(false);
        fetchDashboardData();
        if (onMenuUpdated) onMenuUpdated();
      } else {
        const errorData = await res.json();
        showToast(`فشل الحفظ: ${JSON.stringify(errorData)}`, 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'item') {
        const res = await fetch(`${API_BASE}/items/${deleteConfirm.id}/`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        if (res.ok) {
          showToast(`تم حذف الصنف "${deleteConfirm.name}"`);
          setItems(prev => prev.filter(i => i.id !== deleteConfirm.id));
          if (onMenuUpdated) onMenuUpdated();
        } else {
          showToast('فشل حذف الصنف', 'error');
        }
      } else if (deleteConfirm.type === 'category') {
        const res = await fetch(`${API_BASE}/categories/${deleteConfirm.id}/`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        if (res.ok) {
          showToast(`تم حذف القسم "${deleteConfirm.name}"`);
          fetchDashboardData();
          if (onMenuUpdated) onMenuUpdated();
        } else {
          showToast('فشل حذف القسم', 'error');
        }
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Category Save
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('يرجى كتابة اسم القسم', 'error');
      return;
    }

    try {
      const url = editingCategory
        ? `${API_BASE}/categories/${editingCategory.id}/`
        : `${API_BASE}/categories/`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: categoryFormData.name.trim(),
          icon: categoryFormData.icon.trim() || '🍽️',
          order: parseInt(categoryFormData.order || 0, 10)
        })
      });

      if (res.ok) {
        showToast(editingCategory ? 'تم تحديث القسم بنجاح' : 'تمت إضافة القسم الجديد بنجاح');
        setCategoryModalOpen(false);
        setEditingCategory(null);
        setCategoryFormData({ name: '', icon: '🍽️', order: 0 });
        fetchDashboardData();
        if (onMenuUpdated) onMenuUpdated();
      } else {
        showToast('فشل حفظ القسم', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالسيرفر', 'error');
    }
  };

  // Filtered Items Calculation
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== parseInt(selectedCategory, 10)) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'available' && !item.is_available) return false;
      if (availabilityFilter === 'unavailable' && item.is_available) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const catMatch = (item.category_name || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }
      return true;
    });
  }, [items, selectedCategory, availabilityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter(i => i.is_available).length;
    const unavailable = total - available;
    const totalCategories = categories.length;
    return { total, available, unavailable, totalCategories };
  }, [items, categories]);

  // ------------------------------------------------------------------
  // 1. RENDER LOGIN VIEW (IF NOT AUTHENTICATED)
  // ------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="manager-login-screen">
        <div className="manager-login-card">
          <div className="login-badge">🛡️ لوحة الإدارة للمدير</div>
          <h2 className="login-title">تسجيل دخول المدير</h2>
          <p className="login-subtitle">أدخل بيانات الدخول للتحكم الكامل في الأصناف والأسعار</p>

          {loginError && <div className="login-error-alert">⚠️ {loginError}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>👤 اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="اسم المستخدم (admin)"
                required
              />
            </div>

            <div className="form-group">
              <label>🔑 كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoggingIn}>
              {isLoggingIn ? 'جاري التحقق...' : 'دخول لوحة التحكم 🚀'}
            </button>
          </form>

          <button onClick={onExitToMenu} className="back-to-menu-btn">
            ← العودة لتصفح المنيو كعميل
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. RENDER MANAGER DASHBOARD
  // ------------------------------------------------------------------
  return (
    <div className="manager-dashboard">
      {/* Toast Notification */}
      {toast && (
        <div className={`manager-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Top Header */}
      <header className="manager-header">
        <div className="manager-header-inner">
          <div className="brand-info">
            <img src="/logo.jpg" alt="Logo" style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #D4A017', objectFit: 'cover' }} />
            <div>
              <h1 className="brand-name">لوحة تحكم المدير | MOMO CLUB</h1>
              <p className="brand-status">متصل كـ: <strong>{username}</strong> (صلاحيات كاملة)</p>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={onExitToMenu} className="view-menu-btn" title="معاينة المنيو كما يراه الزبون">
              👁️ معاينة المنيو كعميل
            </button>
            <button onClick={handleLogout} className="logout-btn" title="تسجيل الخروج">
              🚪 خروج
            </button>
          </div>
        </div>
      </header>

      <main className="manager-main-content">
        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon icon-items">🍔</div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">إجمالي الأصناف</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-cats">📑</div>
            <div className="stat-content">
              <span className="stat-number">{stats.totalCategories}</span>
              <span className="stat-label">الأقسام الرئيسية</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-available">✅</div>
            <div className="stat-content">
              <span className="stat-number">{stats.available}</span>
              <span className="stat-label">أصناف متاحة للطلب</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon icon-unavailable">❌</div>
            <div className="stat-content">
              <span className="stat-number">{stats.unavailable}</span>
              <span className="stat-label">أصناف غير متاحة (Out of Stock)</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="controls-bar">
          <div className="controls-actions">
            <button onClick={handleOpenAddItem} className="btn-primary-action">
              <span>➕</span> إضافة صنف جديد
            </button>
            <button onClick={() => setCategoryModalOpen(true)} className="btn-secondary-action">
              <span>📁</span> إدارة الأقسام
            </button>
            <button onClick={() => setQrModalOpen(true)} className="btn-secondary-action" title="توليد وطباعة رمز QR">
              <span>📱</span> رمز QR للمنيو
            </button>
            <button onClick={fetchDashboardData} className="btn-refresh" title="تحديث البيانات">
              🔄 تحديث
            </button>
          </div>

          <div className="controls-search">
            <span className="search-symbol">🔍</span>
            <input
              type="text"
              placeholder="ابحث بالاسم، القسم أو الوصف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="manager-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">✕</button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="filters-strip">
          <div className="category-chips">
            <button
              className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              الكل ({items.length})
            </button>
            {categories.map(cat => {
              const count = items.filter(i => i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`chip ${selectedCategory === String(cat.id) ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(String(cat.id))}
                >
                  <span>{cat.icon}</span> {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="status-chips">
            <button
              className={`status-chip ${availabilityFilter === 'all' ? 'active' : ''}`}
              onClick={() => setAvailabilityFilter('all')}
            >
              الكل
            </button>
            <button
              className={`status-chip ${availabilityFilter === 'available' ? 'active' : ''}`}
              onClick={() => setAvailabilityFilter('available')}
            >
              المتاح فقط ({stats.available})
            </button>
            <button
              className={`status-chip ${availabilityFilter === 'unavailable' ? 'active' : ''}`}
              onClick={() => setAvailabilityFilter('unavailable')}
            >
              غير المتاح ({stats.unavailable})
            </button>
          </div>
        </div>

        {/* Items Listing Table / Cards */}
        {loading ? (
          <div className="manager-loading">
            <div className="spinner"></div>
            <p>جاري تحديث بيانات المنيو...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="manager-empty">
            <span className="empty-symbol">🔍</span>
            <h3>لا توجد أصناف تطابق البحث أو الفلتر</h3>
            <p>جرّب اختيار قسم آخر أو تغيير شروط البحث.</p>
          </div>
        ) : (
          <div className="manager-items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className={`manager-item-card ${!item.is_available ? 'unavailable-card' : ''}`}>
                <div className="item-card-top">
                  <div className="item-badge-category">
                    {item.category_name || 'بدون قسم'}
                  </div>
                  <button
                    onClick={() => toggleItemAvailability(item)}
                    className={`toggle-availability-btn ${item.is_available ? 'active' : 'inactive'}`}
                    title="انقر لتغيير حالة التوفر مباشرة"
                  >
                    {item.is_available ? '✅ متاح' : '❌ غير متاح'}
                  </button>
                </div>

                <div className="item-card-body">
                  <h3 className="item-title">{item.name}</h3>
                  {item.description && (
                    <p className="item-desc">{item.description}</p>
                  )}

                  <div className="item-pricing">
                    {item.has_sizes && item.sizes && item.sizes.length > 0 ? (
                      <div className="sizes-tag-list">
                        {item.sizes.map(s => (
                          <span key={s.id || s.name} className="size-price-tag">
                            {s.name}: <strong>{s.price} ج.م</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="single-price">
                        {item.price} <small>ج.م</small>
                      </span>
                    )}
                  </div>
                </div>

                <div className="item-card-actions">
                  <button
                    onClick={() => handleOpenEditItem(item)}
                    className="action-btn-edit"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'item', id: item.id, name: item.name })}
                    className="action-btn-delete"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* ADD / EDIT ITEM MODAL */}
      {/* ============================================================== */}
      {itemModalOpen && (
        <div className="modal-backdrop" onClick={() => setItemModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? `✏️ تعديل الصنف: ${editingItem.name}` : '➕ إضافة صنف جديد للمنيو'}</h2>
              <button className="modal-close-btn" onClick={() => setItemModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="modal-form">
              <div className="form-group">
                <label>🏷️ اسم الصنف <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="مثال: كباب بلدي، بيتزا مارجريتا، إلخ"
                  value={itemFormData.name}
                  onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>📁 القسم <span className="req">*</span></label>
                  <select
                    value={itemFormData.category}
                    onChange={e => setItemFormData({ ...itemFormData, category: e.target.value })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>الحالة المبدئية</label>
                  <div className="checkbox-wrap">
                    <input
                      type="checkbox"
                      id="itemAvailableCheckbox"
                      checked={itemFormData.is_available}
                      onChange={e => setItemFormData({ ...itemFormData, is_available: e.target.checked })}
                    />
                    <label htmlFor="itemAvailableCheckbox">متاح للطلب الآن</label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>📝 وصف الصنف (اختياري)</label>
                <textarea
                  rows="2"
                  placeholder="وصف مختصر لمكونات الصنف أو طريقة التقديم..."
                  value={itemFormData.description}
                  onChange={e => setItemFormData({ ...itemFormData, description: e.target.value })}
                />
              </div>

              {/* Price Mode Choice */}
              <div className="form-group">
                <label>💰 نظام التسعير</label>
                <div className="pricing-type-switch">
                  <button
                    type="button"
                    className={`pricing-choice-btn ${!itemFormData.has_sizes ? 'selected' : ''}`}
                    onClick={() => setItemFormData({ ...itemFormData, has_sizes: false })}
                  >
                    سعر موحد (صنف بحجم واحد)
                  </button>
                  <button
                    type="button"
                    className={`pricing-choice-btn ${itemFormData.has_sizes ? 'selected' : ''}`}
                    onClick={() => setItemFormData({ ...itemFormData, has_sizes: true })}
                  >
                    أحجام متعددة (ربع / نص / كيلو / أحجام)
                  </button>
                </div>
              </div>

              {!itemFormData.has_sizes ? (
                <div className="form-group">
                  <label>السعر (ج.م) <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="مثال: 120"
                    value={itemFormData.price}
                    onChange={e => setItemFormData({ ...itemFormData, price: e.target.value })}
                    required={!itemFormData.has_sizes}
                  />
                </div>
              ) : (
                <div className="sizes-builder">
                  <label>قائمة الأحجام والأسعار:</label>
                  {itemFormData.sizes.map((size, idx) => (
                    <div key={idx} className="size-row">
                      <input
                        type="text"
                        placeholder="اسم الحجم (مثال: ربع، نص، لارج)"
                        value={size.name}
                        onChange={e => {
                          const updated = [...itemFormData.sizes];
                          updated[idx].name = e.target.value;
                          setItemFormData({ ...itemFormData, sizes: updated });
                        }}
                      />
                      <input
                        type="number"
                        step="0.5"
                        placeholder="السعر ج.م"
                        value={size.price}
                        onChange={e => {
                          const updated = [...itemFormData.sizes];
                          updated[idx].price = e.target.value;
                          setItemFormData({ ...itemFormData, sizes: updated });
                        }}
                      />
                      {itemFormData.sizes.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-size"
                          onClick={() => {
                            const updated = itemFormData.sizes.filter((_, i) => i !== idx);
                            setItemFormData({ ...itemFormData, sizes: updated });
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-add-size"
                    onClick={() => {
                      setItemFormData({
                        ...itemFormData,
                        sizes: [...itemFormData.sizes, { name: '', price: '' }]
                      });
                    }}
                  >
                    ➕ إضافة حجم آخر
                  </button>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setItemModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save">
                  {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف للمنيو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CATEGORY MANAGEMENT MODAL */}
      {/* ============================================================== */}
      {categoryModalOpen && (
        <div className="modal-backdrop" onClick={() => setCategoryModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📁 إدارة أقسام المنيو</h2>
              <button className="modal-close-btn" onClick={() => setCategoryModalOpen(false)}>✕</button>
            </div>

            <div className="categories-list-view">
              <form onSubmit={handleSaveCategory} className="category-inline-form">
                <h4>{editingCategory ? `تعديل قسم: ${editingCategory.name}` : 'إضافة قسم جديد:'}</h4>
                <div className="cat-inputs-row">
                  <input
                    type="text"
                    placeholder="الأيقونة (مثال: 🥩)"
                    value={categoryFormData.icon}
                    onChange={e => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    style={{ width: '80px', textAlign: 'center' }}
                  />
                  <input
                    type="text"
                    placeholder="اسم القسم (مثال: المشويات، ساندوتشات...)"
                    value={categoryFormData.name}
                    onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-save-cat">
                    {editingCategory ? 'حفظ' : '➕ إضافة'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      className="btn-cancel-cat"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormData({ name: '', icon: '🍽️', order: 0 });
                      }}
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>

              <div className="categories-table">
                {categories.map(cat => {
                  const itemCount = items.filter(i => i.category === cat.id).length;
                  return (
                    <div key={cat.id} className="cat-row">
                      <div className="cat-details">
                        <span className="cat-emoji">{cat.icon}</span>
                        <strong className="cat-title">{cat.name}</strong>
                        <span className="cat-count">({itemCount} صنف)</span>
                      </div>
                      <div className="cat-actions">
                        <button
                          className="btn-edit-sm"
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryFormData({
                              name: cat.name,
                              icon: cat.icon || '🍽️',
                              order: cat.order || 0
                            });
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-del-sm"
                          onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-container delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>تأكيد الحذف</h3>
            <p>
              هل أنت متأكد من رغبتك في حذف{' '}
              {deleteConfirm.type === 'item' ? 'الصنف' : 'القسم'}:{' '}
              <strong>"{deleteConfirm.name}"</strong>؟
            </p>
            {deleteConfirm.type === 'category' && (
              <p className="danger-warning">
                ملاحظة: حذف القسم قد يؤثر على الأصناف المرتبطة به.
              </p>
            )}

            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                تراجع
              </button>
              <button className="btn-delete-confirm" onClick={handleConfirmDelete}>
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QR CODE GENERATOR & PRINT MODAL */}
      {/* ============================================================== */}
      {qrModalOpen && (
        <div className="modal-backdrop" onClick={() => setQrModalOpen(false)}>
          <div className="modal-container qr-modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 رمز QR للمنيو الإلكتروني</h2>
              <button className="modal-close-btn" onClick={() => setQrModalOpen(false)}>✕</button>
            </div>

            <div className="qr-modal-body" style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  display: 'inline-block',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  marginBottom: '16px'
                }}
              >
                <div style={{ color: '#125A2C', fontWeight: 900, fontSize: '1.2rem', marginBottom: '8px' }}>
                  MOMO CLUB
                </div>
                <QRCodeCanvas
                  id="manager-qr-canvas"
                  value={qrUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                  fgColor="#125A2C"
                />
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '6px' }}>
                  امسح لتصفح المنيو
                </div>
              </div>

              <div className="form-group" style={{ textAlign: 'right', marginTop: '10px' }}>
                <label>🌐 رابط المنيو (يمكنك تعديله للرابط المنشور أونلاين):</label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={e => setQrUrl(e.target.value)}
                  placeholder="https://momo-club.vercel.app"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    const canvas = document.getElementById('manager-qr-canvas');
                    if (canvas) {
                      const pngUrl = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = 'momo_club_menu_qr.png';
                      link.href = pngUrl;
                      link.click();
                      showToast('تم تحميل صورة رمز QR بنجاح 📥');
                    }
                  }}
                >
                  📥 تحميل صورة الرمز (PNG)
                </button>

                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl);
                    showToast('تم نسخ الرابط إلى الحافظة 📋');
                  }}
                >
                  📋 نسخ الرابط
                </button>

                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => {
                    window.print();
                  }}
                >
                  🖨️ طباعة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
