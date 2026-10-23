import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './index.css';
import './menu-theme.css';
import menuDataFallback from './data/menuData';
import ManagerDashboard from './ManagerDashboard';
import CashierDashboard from './CashierDashboard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const WHATSAPP_NUMBER = '201094740404';
const DELIVERY_NUMBER = '01094740404';
const RESTAURANT_ADDRESS = 'مركز أبو المطامير - كوبري خميس - أمام فرع وي';
const WORKING_HOURS = 'يومياً من 9:00 صباحاً حتى 3:00 صباحاً';

const checkIsCashierRoute = () => {
  const path = window.location.pathname.toLowerCase();
  return path === '/cashier' || path.startsWith('/cashier/');
};

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

const getViewMode = () => (checkIsCashierRoute() ? 'cashier' : checkIsManagerRoute() ? 'manager' : 'menu');

// Arabic-friendly matching: ignore diacritics, unify alef/yaa/taa-marbuta forms
const normalize = (t = '') => String(t).toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660)
  .replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 0x06F0)
  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();

// Open 9:00 to 03:00 Cairo time
const isOpenNow = () => {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })).getHours();
  return h >= 9 || h < 3;
};

function App() {
  const [viewMode, setViewMode] = useState(getViewMode);

  useEffect(() => {
    const handlePopState = () => {
      setViewMode(getViewMode());
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
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // { id } after a direct send
  const [noteFor, setNoteFor] = useState(null); // item id whose notes panel is open
  const [noteText, setNoteText] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [headerShrink, setHeaderShrink] = useState(false);

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
  const addToCart = useCallback((item, category, note = '') => {
    const sizeName = item.has_sizes ? (selectedSizes[item.id] || item.sizes[0]?.name) : null;
    const price = getItemPrice(item, sizeName);
    const cartKey = `${item.id}-${sizeName || 'default'}`;

    setCart(prev => {
      const existing = prev.find(ci => ci.cartKey === cartKey);
      if (existing) {
        return prev.map(ci =>
          ci.cartKey === cartKey
            ? { ...ci, quantity: ci.quantity + 1, note: note ? (ci.note ? `${ci.note}، ${note}` : note) : ci.note }
            : ci
        );
      }
      return [...prev, {
        cartKey,
        id: item.id,
        name: item.name,
        category: category.name,
        size: sizeName,
        price: Number(price),
        quantity: 1,
        note
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
    const query = normalize(searchQuery);
    if (!query) return categories;
    const isNumber = /^\d+(\.\d+)?$/.test(query);
    const priceTexts = (item) => [item.price, ...(item.sizes || []).map(sz => sz.price)]
      .filter(p => p !== null && p !== undefined && p !== '')
      .map(p => String(Number(p)));
    return categories
      .map(cat => {
        // a matching category name shows the whole category
        if (normalize(cat.name).includes(query)) return cat;
        return {
          ...cat,
          items: cat.items.filter(item =>
            normalize(item.name).includes(query) ||
            normalize(item.description).includes(query) ||
            (item.sizes || []).some(sz => normalize(sz.name).includes(query)) ||
            (isNumber && priceTexts(item).some(p => p.includes(query)))
          )
        };
      })
      .filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  // Keep the "current section" label in sync while scrolling
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = (document.querySelector('.header')?.offsetHeight || 200) + 24;
        let current = null;
        for (const cat of filteredCategories) {
          const el = sectionRefs.current[cat.id];
          if (el && el.getBoundingClientRect().top - offset <= 0) current = cat.id;
        }
        if (current) setActiveCategory(prev => (prev === current ? prev : current));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [filteredCategories]);

  useEffect(() => {
    if (!catSheetOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setCatSheetOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [catSheetOpen]);

  // Lock page scroll behind the cart / category sheet; Escape closes the cart
  useEffect(() => {
    if (!isCartOpen && !catSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setIsCartOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [isCartOpen, catSheetOpen]);

  // Scroll to category section
  const scrollToCategory = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    const section = sectionRefs.current[categoryId];
    if (section) {
      const headerHeight = (document.querySelector('.header')?.offsetHeight || 200) + 8;
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
    const notedCount = cart.filter(ci => ci.note).length;
    if (notedCount > 0) {
      message += `⚠️ *يوجد ملاحظات على ${notedCount} ${notedCount === 1 ? 'صنف' : 'أصناف'}، راجعها قبل التحضير*\n\n`;
    }


    if (orderType === 'dine-in') {
      message += `📍 *داخل المطعم*\n`;
      message += `🪑 رقم الطاولة: *${tableNumber || 'غير محدد'}*\n\n`;
    } else {
      message += `🚚 *توصيل للمنزل*\n`;
      message += `👤 الاسم: *${customerName || 'غير محدد'}*\n`;
      message += `📞 الهاتف: *${customerPhone || 'غير محدد'}*\n`;
      message += `📍 العنوان: *${customerAddress || 'غير محدد'}*\n\n`;
    }

    message += '📋 *تفاصيل الطلب:*\n';
    message += '──────────────────\n';

    cart.forEach((item, index) => {
      const sizeText = item.size ? ` (${item.size})` : '';
      const itemTotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name}${sizeText}\n`;
      message += `   ${item.quantity} × ${item.price} = *${itemTotal} ج.م*\n`;
      if (item.note) {
        // one line only: collapse line breaks and strip WhatsApp formatting characters
        const oneLine = item.note.replace(/[\r\n]+/g, ' ').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim();
        message += `   ⚠️ *ملاحظات:* ${oneLine}\n`;
      }
    });

    message += '\n──────────────────\n';
    message += `💰 *الإجمالي: ${cartTotals.totalPrice} ج.م*\n`;
    message += `📦 عدد الأصناف: ${cartTotals.totalItems}\n`;


    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    message += '🕐 شكراً لاختيارك MOMO CLUB!';

    return encodeURIComponent(message);
  }, [cart, orderType, tableNumber, customerName, customerAddress, customerPhone, cartTotals]);

  // Validate the cart form; true when the order can be sent
  const validateOrder = useCallback(() => {
    if (cart.length === 0) { showToast('السلة فارغة!', 'error'); return false; }
    if (orderType === 'dine-in' && !tableNumber.trim()) { showToast('من فضلك أدخل رقم الطاولة', 'error'); return false; }
    if (orderType === 'delivery') {
      if (!customerName.trim() || !customerAddress.trim()) { showToast('من فضلك أدخل الاسم والعنوان', 'error'); return false; }
      const phone = customerPhone.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660).replace(/[\s\-+]/g, '');
      if (!/^(01[0125]\d{8}|201[0125]\d{8})$/.test(phone)) { showToast('رقم الهاتف غير صحيح (مثال: 01012345678)', 'error'); return false; }
    }
    return true;
  }, [cart, orderType, tableNumber, customerName, customerAddress, customerPhone, showToast]);

  // Save the order in the restaurant system (the cashier screen reads it from there)
  const submitOrder = useCallback((source) => fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      order_type: orderType,
      source,
      table_number: tableNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: cart.map(ci => ({ id: ci.id, size: ci.size || '', quantity: ci.quantity, note: ci.note || '' })),
    }),
  }), [cart, orderType, tableNumber, customerName, customerPhone, customerAddress]);

  const resetOrderForm = useCallback(() => {
    setCart([]);
    setIsCartOpen(false);
    setTableNumber('');
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
    setNoteFor(null);
    setNoteText('');
  }, []);

  // Send via WhatsApp (the order is also saved for the cashier screen)
  const sendWhatsApp = useCallback(() => {
    if (!validateOrder()) return;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    submitOrder('whatsapp').catch(() => {}); // never block WhatsApp if the system is unreachable
    window.open(url, '_blank');
    resetOrderForm();
    showToast('✅ تم تجهيز طلبك، أكمل الإرسال من واتساب!', 'success');
  }, [validateOrder, submitOrder, buildWhatsAppMessage, resetOrderForm, showToast]);

  // Send straight to the restaurant system
  const sendToRestaurant = useCallback(async () => {
    if (sending || !validateOrder()) return;
    setSending(true);
    try {
      const res = await submitOrder('app');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
        showToast(`❌ ${typeof first === 'string' ? first : 'تعذر إرسال الطلب، حاول مرة أخرى'}`, 'error');
        return;
      }
      resetOrderForm();
      setOrderSuccess({ id: data.id });
    } catch {
      showToast('❌ تعذر الاتصال، تحقق من الإنترنت أو أرسل عبر واتساب', 'error');
    } finally {
      setSending(false);
    }
  }, [sending, validateOrder, submitOrder, resetOrderForm, showToast]);

  // Cashier mode: separate login, token and API from the manager
  if (viewMode === 'cashier') {
    return <CashierDashboard />;
  }

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
              <span className="marquee">
                <span className="marquee-track">
                  <span>{RESTAURANT_ADDRESS}</span>
                  <span aria-hidden="true">{RESTAURANT_ADDRESS}</span>
                </span>
              </span>
            </span>
            <span className="topbar-divider">|</span>
            <span className="topbar-item" title="مواعيد العمل">
              <span className={`open-chip ${isOpenNow() ? 'is-open' : ''}`}>{isOpenNow() ? 'مفتوح الآن حتى 3 ص' : 'مغلق حاليًا، نفتح 9 ص'}</span>
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
              placeholder="ابحث بالقسم أو الصنف أو السعر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Category Navigation */}
          <div className="cat-trigger-wrap">
            <button className="cat-trigger" onClick={() => setCatSheetOpen(true)} aria-haspopup="dialog">
              <span className="cat-trigger-current">
                {(categories.find(c => c.id === activeCategory) || categories[0])?.name}
              </span>
              <span className="cat-trigger-all">كل الأقسام ({categories.length}) ▾</span>
            </button>
          </div>
        </div>
      </header>

      {orderSuccess && (
        <div className="cat-sheet-backdrop" onClick={() => setOrderSuccess(null)}>
          <div className="cat-sheet success-sheet" role="dialog" aria-modal="true" aria-label="تم إرسال الطلب" onClick={e => e.stopPropagation()}>
            <div className="success-mark" aria-hidden="true">✓</div>
            <h3>تم إرسال طلبك للمطعم</h3>
            <div className="success-no">رقم الطلب <strong dir="ltr">#{orderSuccess.id}</strong></div>
            <p>سنبدأ تحضيره الآن. احتفظ برقم الطلب لو احتجت أي استفسار.</p>
            <button className="note-confirm" onClick={() => setOrderSuccess(null)}>تمام</button>
          </div>
        </div>
      )}

      {catSheetOpen && (
        <div className="cat-sheet-backdrop" onClick={() => setCatSheetOpen(false)}>
          <div className="cat-sheet" role="dialog" aria-modal="true" aria-label="الأقسام" onClick={e => e.stopPropagation()}>
            <div className="cat-sheet-head">
              <span>الأقسام</span>
              <button className="cat-sheet-close" onClick={() => setCatSheetOpen(false)} aria-label="إغلاق">×</button>
            </div>
            <div className="cat-sheet-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-sheet-item ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => { scrollToCategory(cat.id); setCatSheetOpen(false); }}
                >
                  <span className="cat-sheet-name">{cat.name}</span>
                  <span className="cat-sheet-count">{cat.items?.length || 0} صنف</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                      <div className="item-line">
                        <h3 className="item-name">{item.name}</h3>
                        {!item.has_sizes && (
                          <>
                            <span className="item-leader" aria-hidden="true" />
                            <div className="item-price-tag">
                              <span className="price-val">{item.price}</span>
                              <span className="price-curr"> ج.م</span>
                            </div>
                          </>
                        )}
                      </div>
                      {item.description && (
                        <p className="item-description">{item.description}</p>
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
                            onClick={() => { setNoteFor(item.id); setNoteText(''); }}
                          >
                            <span className="add-plus">+</span>
                            <span>أضف للطلب</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {noteFor === item.id && qtyInCart === 0 && (
                      <div className="note-panel">
                        <label className="note-label" htmlFor={`note-${item.id}`}>ملاحظات</label>
                        <textarea
                          id={`note-${item.id}`}
                          rows={2}
                          maxLength={200}
                          autoFocus
                          placeholder="مثال: بدون بصل (اختياري)"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                        />
                        <div className="note-actions">
                          <button
                            type="button"
                            className="note-confirm"
                            onClick={() => { addToCart(item, category, noteText.trim()); setNoteFor(null); setNoteText(''); }}
                          >
                            تأكيد الإضافة
                          </button>
                          <button type="button" className="note-cancel" onClick={() => setNoteFor(null)}>إلغاء</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="momo-footer">
        <div className="foot-stars" aria-hidden="true">{'★'.repeat(21)}</div>
        <div className="foot-inner">
          <a className="foot-order" href={`tel:${DELIVERY_NUMBER}`}>
            <span className="foot-order-label">اطلب ديليفري يوصلك سخن لحد البيت</span>
            <span className="foot-order-num" dir="ltr">{DELIVERY_NUMBER}</span>
          </a>

          <dl className="foot-info">
            <div><dt>العنوان</dt><dd>{RESTAURANT_ADDRESS}</dd></div>
            <div><dt>مواعيد العمل</dt><dd>{WORKING_HOURS}</dd></div>
            <div><dt>مطبخنا</dt><dd>مشويات على الفحم، طواجن، بيتزا، كريب، باستا، برجر، مشروبات وشيشة.</dd></div>
          </dl>

          <div className="foot-actions">
            <a className="foot-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">راسلنا على واتساب</a>
            <a className="foot-link" href={`tel:${DELIVERY_NUMBER}`}>اتصل بنا</a>
          </div>

          <div className="foot-bottom">
            <div className="foot-brand">
              <img src="/logo.jpg" alt="" className="foot-logo" />
              <div>
                <div className="foot-name">MOMO CLUB</div>
                <div className="foot-copy">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
              </div>
            </div>
            <div className="foot-credit" dir="ltr">Designed & Developed by <strong>Eng. Mahmoud Wafi</strong></div>
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
                          {item.note && (
                            <div className="cart-item-note">ملاحظات: {item.note}</div>
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
                          <label>رقم الهاتف</label>
                          <input
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            placeholder="01XXXXXXXXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
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
                  </div>
                </div>
              )}

              {/* Send buttons */}
              {cart.length > 0 && (
                <div className="send-buttons">
                  <button className="send-direct-btn" onClick={sendToRestaurant} disabled={sending}>
                    {sending ? 'جاري الإرسال…' : 'إرسال الطلب للمطعم'}
                  </button>
                  <button className="whatsapp-btn" onClick={sendWhatsApp}>
                    إرسال عبر واتساب
                  </button>
                </div>
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
