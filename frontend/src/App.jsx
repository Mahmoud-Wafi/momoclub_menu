import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './index.css';
import menuDataFallback from './data/menuData';
import ManagerDashboard from './ManagerDashboard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const WHATSAPP_NUMBER = '201127603628';
const DELIVERY_NUMBER = '01127603628';
const RESTAURANT_ADDRESS = 'مركز أبو المطامير - كوبري خميس - أمام فرع وي';
const WORKING_HOURS = 'يومياً من 9:00 صباحاً حتى 3:00 صباحاً';

const checkIsManagerRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/manager' ||
    path === '/admin' ||
    path.startsWith('/manager/') ||
    path.startsWith('/admin/') ||
    hash === '#/manager' ||
    hash === '#/admin' ||
    params.get('mode') === 'manager'
  );
};

function App() {
  const [viewMode, setViewMode] = useState(() => (checkIsManagerRoute() ? 'manager' : 'menu'));

  useEffect(() => {
    const handlePopState = () => {
      setViewMode(checkIsManagerRoute() ? 'manager' : 'menu');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleExitToMenu = useCallback(() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState({}, '', '/');
    }
    setViewMode('menu');
  }, []);

  // State
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [headerShrink, setHeaderShrink] = useState(false);

  const categoryNavRef = useRef(null);
  const sectionRefs = useRef({});

  // Shrink header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setHeaderShrink(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch menu data
  const fetchMenu = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/menu/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) setActiveCategory(prev => prev || data[0].id);
      } else {
        throw new Error('API Error');
      }
    } catch (error) {
      console.log('Using fallback menu data');
      setCategories(menuDataFallback);
      if (menuDataFallback.length > 0) setActiveCategory(prev => prev || menuDataFallback[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Get item price (considering size selection)
  const getItemPrice = useCallback((item, selectedSize) => {
    if (item.has_sizes && item.sizes?.length > 0) {
      if (selectedSize) {
        const size = item.sizes.find(s => s.name === selectedSize);
        return size ? size.price : item.sizes[0].price;
      }
      return item.sizes[0].price;
    }
    return item.price;
  }, []);

  // Add to cart
  const addToCart = useCallback((item, category) => {
    const sizeName = item.has_sizes ? (selectedSizes[item.id] || item.sizes[0]?.name) : null;
    const price = getItemPrice(item, sizeName);
    const cartKey = `${item.id}-${sizeName || 'default'}`;

    setCart(prev => {
      const existing = prev.find(ci => ci.cartKey === cartKey);
      if (existing) {
        return prev.map(ci =>
          ci.cartKey === cartKey ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, {
        cartKey,
        id: item.id,
        name: item.name,
        category: category.name,
        size: sizeName,
        price: Number(price),
        quantity: 1
      }];
    });

    showToast(`✅ تم إضافة ${item.name} للسلة`);
  }, [selectedSizes, getItemPrice, showToast]);

  // Update quantity in cart
  const updateQuantity = useCallback((cartKey, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartKey === cartKey) {
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  }, []);

  // Cart totals
  const cartTotals = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { totalItems, totalPrice };
  }, [cart]);

  // Filter items by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.trim().toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.name.toLowerCase().includes(query)
      )
    })).filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  // Scroll to category section
  const scrollToCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    const section = sectionRefs.current[categoryId];
    if (section) {
      const headerHeight = 200;
      const top = section.offsetTop - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Handle size selection
  const handleSizeSelect = useCallback((itemId, sizeName) => {
    setSelectedSizes(prev => ({ ...prev, [itemId]: sizeName }));
  }, []);

  // Get cart item quantity
  const getCartQuantity = useCallback((itemId, sizeName) => {
    const cartKey = `${itemId}-${sizeName || 'default'}`;
    const item = cart.find(ci => ci.cartKey === cartKey);
    return item ? item.quantity : 0;
  }, [cart]);

  // Build WhatsApp message
  const buildWhatsAppMessage = useCallback(() => {
    let message = '🍽️ *طلب جديد من MOMO CLUB*\n';
    message += `📍 ${RESTAURANT_ADDRESS}\n`;
    message += `🕐 مواعيد العمل: ${WORKING_HOURS}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━\n\n';

    if (orderType === 'dine-in') {
      message += `📍 *داخل المطعم*\n`;
      message += `🪑 رقم الطاولة: *${tableNumber || 'غير محدد'}*\n\n`;
    } else {
      message += `🚚 *توصيل للمنزل*\n`;
      message += `👤 الاسم: *${customerName || 'غير محدد'}*\n`;
      message += `📍 العنوان: *${customerAddress || 'غير محدد'}*\n\n`;
    }

    message += '📋 *تفاصيل الطلب:*\n';
    message += '──────────────────\n';

    cart.forEach((item, index) => {
      const sizeText = item.size ? ` (${item.size})` : '';
      const itemTotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name}${sizeText}\n`;
      message += `   ${item.quantity} × ${item.price} = *${itemTotal} ج.م*\n`;
    });

    message += '\n──────────────────\n';
    message += `💰 *الإجمالي: ${cartTotals.totalPrice} ج.م*\n`;
    message += `📦 عدد الأصناف: ${cartTotals.totalItems}\n`;

    if (orderNotes) {
      message += `\n📝 *ملاحظات:* ${orderNotes}\n`;
    }

    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    message += '🕐 شكراً لاختيارك MOMO CLUB!';

    return encodeURIComponent(message);
  }, [cart, orderType, tableNumber, customerName, customerAddress, orderNotes, cartTotals]);

  // Send order via WhatsApp
  const sendWhatsApp = useCallback(() => {
    if (cart.length === 0) {
      showToast('❌ السلة فارغة!', 'error');
      return;
    }

    if (orderType === 'dine-in' && !tableNumber.trim()) {
      showToast('❌ من فضلك أدخل رقم الطاولة', 'error');
      return;
    }

    if (orderType === 'delivery' && (!customerName.trim() || !customerAddress.trim())) {
      showToast('❌ من فضلك أدخل الاسم والعنوان', 'error');
      return;
    }

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');

    // Empty cart and reset order inputs
    setCart([]);
    setIsCartOpen(false);
    setTableNumber('');
    setCustomerName('');
    setCustomerAddress('');
    setOrderNotes('');
    showToast('✅ تم إرسال الطلب وإفراغ السلة بنجاح!', 'success');
  }, [cart, orderType, tableNumber, customerName, customerAddress, buildWhatsAppMessage, showToast]);

  // Manager mode
  if (viewMode === 'manager') {
    return (
      <ManagerDashboard
        onExitToMenu={handleExitToMenu}
        onMenuUpdated={fetchMenu}
      />
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="loading-container">
        <img src="/logo.jpg" alt="MOMO CLUB" className="loading-logo" />
        <div className="loading-spinner"></div>
        <p className="loading-text">جاري تحميل المنيو...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ====== HERO HEADER ====== */}
      <header className={`header ${headerShrink ? 'header--shrink' : ''}`}>
        {/* Top Bar - Restaurant Info */}
        <div className={`header-topbar ${headerShrink ? 'hide' : ''}`}>
          <div className="topbar-inner">
            <span className="topbar-item topbar-address" title="العنوان">
              <span>📍</span> {RESTAURANT_ADDRESS}
            </span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item" title="مواعيد العمل">
              <span>🕐</span> 9 ص - 3 ص
            </span>
            <span className="topbar-divider">|</span>
            <a href={`tel:${DELIVERY_NUMBER}`} className="topbar-item topbar-phone" title="طلب ديليفري">
              <span>📞</span> {DELIVERY_NUMBER}
            </a>
          </div>
        </div>

        <div className="header-content">
          {/* Brand Row */}
          <div className="header-brand-row">
            <div className="logo-container">
              <img src="/logo.jpg" alt="MOMO CLUB" className="brand-logo-img" />
              <div>
                <div className="logo-text">MOMO CLUB</div>
                <div className="logo-subtitle">Cafe & Restaurant</div>
              </div>
            </div>

            {/* Cart Button in header */}
            <button className="header-cart-btn" onClick={() => setIsCartOpen(true)}>
              <span className="header-cart-icon">🛒</span>
              {cartTotals.totalItems > 0 && (
                <span className="header-cart-count">{cartTotals.totalItems}</span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="ابحث عن أي صنف في المنيو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Category Navigation */}
          <nav className="category-nav" ref={categoryNavRef}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ====== MENU CONTENT ====== */}
      <main className="menu-content">
        {/* Search results info */}
        {searchQuery && (
          <div className="search-results-info">
            <span>🔍</span>
            <span>نتائج البحث عن &quot;{searchQuery}&quot;</span>
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ✕ مسح
            </button>
          </div>
        )}

        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {filteredCategories.map(category => (
          <section
            key={category.id}
            ref={el => sectionRefs.current[category.id] = el}
          >
            <div className="section-title">
              <span className="section-icon">{category.icon}</span>
              <h2>{category.name}</h2>
              <span className="item-count">{category.items.length} صنف</span>
            </div>

            <div className="items-grid">
              {category.items.map((item, index) => {
                const currentSize = selectedSizes[item.id] || (item.has_sizes && item.sizes?.[0]?.name);
                const currentPrice = getItemPrice(item, currentSize);
                const qtyInCart = getCartQuantity(item.id, currentSize);

                const isInCart = qtyInCart > 0;

                return (
                  <div
                    key={item.id}
                    className={`menu-card ${isInCart ? 'menu-card--in-cart' : ''}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="card-top">
                      <div className="item-header-info">
                        <h3 className="item-name">{item.name}</h3>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                      </div>

                      {!item.has_sizes && (
                        <div className="item-price-tag">
                          <span className="price-val">{item.price}</span>
                          <span className="price-curr"> ج.م</span>
                        </div>
                      )}
                    </div>

                    {/* Size Selector if item has sizes */}
                    {item.has_sizes && item.sizes?.length > 0 && (
                      <div className="card-sizes-block">
                        <span className="sizes-hint">اختر الحجم:</span>
                        <div className="size-chips-grid">
                          {item.sizes.map(size => {
                            const isSelected = currentSize === size.name;
                            return (
                              <button
                                key={size.name}
                                type="button"
                                className={`size-chip ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSizeSelect(item.id, size.name)}
                              >
                                <span className="chip-name">{size.name}</span>
                                <span className="chip-price">{size.price} ج.م</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Card Actions Bottom Row */}
                    <div className="card-bottom-row">
                      {item.has_sizes ? (
                        <div className="size-active-price">
                          <span className="active-price-label">السعر:</span>
                          <span className="active-price-val">{currentPrice} <span className="price-curr">ج.م</span></span>
                        </div>
                      ) : <div className="card-bottom-spacer" />}

                      <div className="card-action-container">
                        {qtyInCart > 0 ? (
                          <div className="quantity-stepper">
                            <button
                              type="button"
                              className="stepper-btn stepper-dec"
                              onClick={() => updateQuantity(`${item.id}-${currentSize || 'default'}`, -1)}
                              aria-label="تقليل"
                            >
                              −
                            </button>
                            <span className="stepper-qty">{qtyInCart}</span>
                            <button
                              type="button"
                              className="stepper-btn stepper-inc"
                              onClick={() => updateQuantity(`${item.id}-${currentSize || 'default'}`, 1)}
                              aria-label="زيادة"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="add-to-cart-btn"
                            onClick={() => addToCart(item, category)}
                          >
                            <span className="add-plus">+</span>
                            <span>أضف للطلب</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* ====== PREMIUM FOOTER ====== */}
      <footer className="site-footer">
        <div className="footer-inner">
          {/* Footer Top */}
          <div className="footer-top">
            <div className="footer-brand">
              <img src="/logo.jpg" alt="MOMO CLUB" className="footer-logo" />
              <div>
                <div className="footer-brand-name">MOMO CLUB</div>
                <div className="footer-brand-sub">Cafe & Restaurant</div>
              </div>
            </div>
            <p className="footer-tagline">أفضل المشويات والأكلات الشرقية والغربية مع أجود الخامات وأطعم النكهات 🔥</p>
          </div>

          {/* Footer Grid */}
          <div className="footer-grid">
            {/* Address & Hours */}
            <div className="footer-section">
              <h4 className="footer-section-title">📍 فرعنا ومواعيد العمل</h4>
              <ul className="footer-list">
                <li className="footer-info-item">
                  <span className="footer-link-icon">📌</span>
                  <span><strong>العنوان:</strong> {RESTAURANT_ADDRESS}</span>
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">🕐</span>
                  <span><strong>مواعيد العمل:</strong> {WORKING_HOURS}</span>
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">🚚</span>
                  <span>خدمة التوصيل (ديليفري) متاحة طوال فترة العمل</span>
                </li>
              </ul>
            </div>

            {/* Delivery Contact */}
            <div className="footer-section">
              <h4 className="footer-section-title">📞 الطلبات والتوصيل</h4>
              <ul className="footer-list">
                <li>
                  <a href={`tel:${DELIVERY_NUMBER}`} className="footer-link">
                    <span className="footer-link-icon">📱</span>
                    <span>خط الديليفري السريع: <strong>{DELIVERY_NUMBER}</strong></span>
                  </a>
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">🍽️</span>
                  <span>صالة مميزة ومكيفة للعائلات والأفراد</span>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4 className="footer-section-title">⭐ خدماتنا</h4>
              <ul className="footer-list">
                <li className="footer-info-item">
                  <span className="footer-link-icon">🥩</span>
                  مشويات على الفحم وطواجن شرقية
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">🍕</span>
                  بيتزا إيطالية، كريب، باستا وبرجر
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">☕</span>
                  مشروبات ساخنة وباردة وكوكتيلات فريش
                </li>
                <li className="footer-info-item">
                  <span className="footer-link-icon">💨</span>
                  شيشة فاخرة بنكهات خاصة
                </li>
              </ul>
            </div>
          </div>

          {/* Delivery Banner */}
          <div className="footer-delivery-banner">
            <a href={`tel:${DELIVERY_NUMBER}`} className="delivery-banner-link">
              <span className="delivery-emoji">🚚</span>
              <div>
                <strong>اطلب ديليفري يوصلك سخن وطازة لحد باب بيتك!</strong>
                <span className="delivery-num">{DELIVERY_NUMBER}</span>
                <span className="delivery-loc-sub">{RESTAURANT_ADDRESS}</span>
              </div>
              <span className="delivery-arrow">←</span>
            </a>
          </div>

          {/* Copyright & Designer */}
          <div className="footer-bottom">
            <p className="footer-copyright">© {new Date().getFullYear()} MOMO CLUB Cafe & Restaurant — جميع الحقوق محفوظة</p>
            <div className="footer-designer-wrapper">
              <div className="footer-designer-badge" dir="ltr">
                <span className="designer-icon">✨</span>
                <span className="designer-text">Designed & Developed by :</span>
                <strong className="designer-name">Eng. Mahmoud Wafi</strong>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ====== FLOATING CART BAR ====== */}
      {cartTotals.totalItems > 0 && !isCartOpen && (
        <div className="floating-cart">
          <div className="cart-bar" onClick={() => setIsCartOpen(true)}>
            <div className="cart-info">
              <div className="cart-icon-badge">
                🛒
                <span className="cart-badge">{cartTotals.totalItems}</span>
              </div>
              <span className="cart-text">عرض السلة</span>
            </div>
            <span className="cart-total">
              {cartTotals.totalPrice}
              <span className="currency-sm"> ج.م</span>
            </span>
          </div>
        </div>
      )}

      {/* ====== CART MODAL ====== */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
          <div className="cart-modal">
            <div className="cart-modal-content">
              <div className="cart-handle">
                <div className="cart-handle-bar"></div>
              </div>

              <div className="cart-header">
                <h2>🛒 سلة المشتريات</h2>
                <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🛒</div>
                  <p>السلة فارغة</p>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map(item => (
                      <div key={item.cartKey} className="cart-item">
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          {item.size && (
                            <div className="cart-item-size">الحجم: {item.size}</div>
                          )}
                          <div className="cart-item-price">
                            {item.price * item.quantity} ج.م
                          </div>
                        </div>
                        <div className="cart-item-qty">
                          <button
                            className="qty-btn decrease"
                            onClick={() => updateQuantity(item.cartKey, -1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.cartKey, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.cartKey)}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div className="summary-row">
                      <span>عدد الأصناف</span>
                      <span>{cartTotals.totalItems}</span>
                    </div>
                    <div className="summary-row total">
                      <span>الإجمالي</span>
                      <span className="total-price">{cartTotals.totalPrice} ج.م</span>
                    </div>
                  </div>
                </>
              )}

              {/* Order Type Selection */}
              {cart.length > 0 && (
                <div className="order-section">
                  <h3>📍 نوع الطلب</h3>
                  <div className="order-type-tabs">
                    <button
                      className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`}
                      onClick={() => setOrderType('dine-in')}
                    >
                      <span className="type-icon">🏪</span>
                      داخل المطعم
                    </button>
                    <button
                      className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                      onClick={() => setOrderType('delivery')}
                    >
                      <span className="type-icon">🚚</span>
                      توصيل للمنزل
                    </button>
                  </div>

                  <div className="order-form">
                    {orderType === 'dine-in' ? (
                      <div className="form-group">
                        <label>🪑 رقم الطاولة</label>
                        <input
                          type="text"
                          placeholder="مثال: 5"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>👤 الاسم</label>
                          <input
                            type="text"
                            placeholder="اسمك بالكامل"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>📍 العنوان</label>
                          <input
                            type="text"
                            placeholder="عنوان التوصيل بالتفصيل"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label>📝 ملاحظات (اختياري)</label>
                      <textarea
                        rows={2}
                        placeholder="مثال: بدون بصل، حار، ..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Send Button */}
              {cart.length > 0 && (
                <button className="whatsapp-btn" onClick={sendWhatsApp}>
                  <span className="wa-icon">💬</span>
                  إرسال الطلب عبر واتساب
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ====== TOAST ====== */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
