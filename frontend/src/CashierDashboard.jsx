/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './cashier.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const TOKEN_KEY = 'momo_cashier_token';
const SOUND_KEY = 'momo_cashier_sound';
const POLL_MS = 5000;

const SOURCE = { whatsapp: 'واتساب', app: 'المنيو' };
const money = (n) => `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })} ج.م`;
const clock = (d) => new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
const ageMin = (d, now) => Math.max(0, Math.floor((now - new Date(d).getTime()) / 60000));
const ageText = (m) => (m < 1 ? 'الآن' : m < 60 ? `منذ ${m} د` : `منذ ${Math.floor(m / 60)} س ${m % 60} د`);

/* ---------------- search ---------------- */
// Arabic-friendly: ignore diacritics, Arabic-Indic digits, alef/yaa/taa-marbuta variants
const norm = (t = '') => String(t).toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
  .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x06F0)
  .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/\s+/g, ' ').trim();

// A plain number is a table (exact, so 4 never matches 14) or the tail of a phone number;
// "#12" is an order number; text searches name, address, items and notes
function orderMatches(o, q) {
  if (/^#\d+$/.test(q)) return String(o.id) === q.slice(1);
  if (/^\d+$/.test(q)) return o.table_number === q || (q.length >= 4 && o.customer_phone.includes(q));
  const table = q.match(/^(?:طاوله|ترابيزه|table)\s*(\d+)$/);
  if (table) return o.table_number === table[1];
  if (['ديليفري', 'دليفري', 'توصيل', 'delivery'].includes(q)) return o.order_type === 'delivery';
  return [o.customer_name, o.customer_address, ...o.items.flatMap((i) => [i.name, i.size, i.note])]
    .some((v) => norm(v).includes(q));
}

const splitOrders = (list) => {
  const seen = list.filter((o) => o.acknowledged_at);
  const dineOrders = seen.filter((o) => o.order_type === 'dine-in');
  const map = new Map();
  dineOrders.forEach((o) => {
    const key = o.table_number || '—';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(o);
  });
  return {
    fresh: list.filter((o) => !o.acknowledged_at),
    dine: dineOrders,
    delivery: seen.filter((o) => o.order_type === 'delivery'),
    tables: [...map.entries()],
  };
};

/* ---------------- login ---------------- */
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cashier/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) onLogin(data.token);
      else if (res.status === 429) setError('محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.');
      else setError(data.message || 'بيانات الدخول غير صحيحة');
    } catch {
      setError('تعذر الاتصال بالسيرفر. تحقق من الإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cashier-app cashier-login" dir="rtl">
      <form className="cashier-login-card" onSubmit={submit}>
        <img src="/logo.jpg" alt="" className="cashier-logo" />
        <h1>شاشة الكاشير</h1>
        <p>سجّل الدخول لاستقبال الطلبات ومتابعتها.</p>
        {error && <div className="cashier-error" role="alert">{error}</div>}
        <label htmlFor="c-user">اسم المستخدم</label>
        <input id="c-user" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label htmlFor="c-pass">كلمة المرور</label>
        <input id="c-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="cashier-btn cashier-btn-primary" disabled={loading}>{loading ? 'جاري الدخول…' : 'دخول'}</button>
      </form>
    </div>
  );
}

/* ---------------- order card ---------------- */
function OrderCard({ order, now, busy, showType, retention, onAck }) {
  const isNew = !order.acknowledged_at;
  const mins = ageMin(order.created_at, now);
  const late = isNew && mins >= 5;
  const hasNotes = order.items.some((i) => i.note);
  const leftMin = order.expires_at ? Math.min(retention, Math.max(0, Math.ceil((new Date(order.expires_at).getTime() - now) / 60000))) : null;

  return (
    <article className={`order-card ${isNew ? 'is-new' : 'is-seen'} ${late ? 'is-late' : ''}`}>
      <header className="order-head">
        <div className="order-no" dir="ltr">#{order.id}</div>
        <div className="order-meta">
          <span>{clock(order.created_at)}</span>
          <span className={late ? 'late-text' : ''}>{ageText(mins)}</span>
        </div>
        {showType && (
          <span className="type-tag">{order.order_type === 'dine-in' ? `طاولة ${order.table_number}` : 'ديليفري'}</span>
        )}
        <span className="source-tag">{SOURCE[order.source] || order.source}</span>
      </header>

      {order.order_type === 'delivery' && (
        <div className="who">
          <div className="who-name">{order.customer_name}</div>
          <div className="who-address">{order.customer_address}</div>
          <a className="who-phone" href={`tel:${order.customer_phone}`} dir="ltr">{order.customer_phone}</a>
        </div>
      )}

      {hasNotes && <div className="notes-alert">⚠️ في هذا الطلب ملاحظات، راجعها قبل التحضير</div>}

      <ul className="lines">
        {order.items.map((i) => (
          <li key={i.id} className="line">
            <span className="line-qty">{i.quantity}×</span>
            <span className="line-name">
              {i.name}
              {i.size && <em> ({i.size})</em>}
            </span>
            <span className="line-price">{money(i.price * i.quantity)}</span>
            {i.note && <span className="line-note">⚠️ <b>ملاحظات:</b> {i.note}</span>}
          </li>
        ))}
      </ul>

      <footer className="order-foot">
        <div className="order-total"><span>الإجمالي</span><strong>{money(order.total)}</strong></div>
        {isNew ? (
          <button className="cashier-btn cashier-btn-primary ok-btn" disabled={busy} onClick={() => onAck(order.id)}>
            موافق
          </button>
        ) : (
          <div className="auto-delete">تُحذف تلقائيًا بعد {leftMin} د</div>
        )}
      </footer>
    </article>
  );
}

/* ---------------- main ---------------- */
export default function CashierDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [section, setSection] = useState('dine-in'); // phone: which list is shown
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');
  const [retention, setRetention] = useState(60); // minutes before an acknowledged order is deleted
  const [online, setOnline] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [busyId, setBusyId] = useState(null);
  const [banner, setBanner] = useState('');
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem(SOUND_KEY) === '1');

  const audioRef = useRef(null);
  const soundRef = useRef(soundOn);
  const seenRef = useRef(null); // ids already seen (null until the first load)
  soundRef.current = soundOn;

  const logout = useCallback(() => {
    if (token) fetch(`${API_BASE}/cashier/auth/logout/`, { method: 'POST', headers: { Authorization: `Token ${token}` } }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOrders([]);
    setLoaded(false);
    seenRef.current = null;
  }, [token]);

  const beep = useCallback(() => {
    if (!soundRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioRef.current || (audioRef.current = new Ctx());
      ctx.resume?.();
      [0, 0.2, 0.4].forEach((t, k) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = k === 2 ? 1175 : 880;
        o.connect(g);
        g.connect(ctx.destination);
        const s = ctx.currentTime + t;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.35, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.17);
        o.start(s);
        o.stop(s + 0.2);
      });
    } catch { /* sound is optional */ }
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem(SOUND_KEY, next ? '1' : '0');
    if (next) { soundRef.current = true; beep(); } // the click unlocks audio in the browser
  };

  const flash = (text) => { setBanner(text); setTimeout(() => setBanner(''), 6000); };

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/cashier/orders/`, { headers: { Authorization: `Token ${token}` } });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();

      if (seenRef.current) {
        const fresh = data.orders.filter((o) => !o.acknowledged_at && !seenRef.current.has(o.id));
        if (fresh.length) {
          beep();
          flash(fresh.length === 1 ? `طلب جديد \u2066#${fresh[0].id}\u2069` : `${fresh.length} طلبات جديدة`);
        }
      }
      seenRef.current = new Set([...(seenRef.current || []), ...data.orders.map((o) => o.id)]);

      setOrders(data.orders);
      if (data.retention_minutes) setRetention(data.retention_minutes);
      setOnline(true);
      setUpdatedAt(new Date());
      setLoaded(true);
    } catch {
      setOnline(false);
    }
  }, [token, beep, logout]);

  useEffect(() => {
    if (!token) return undefined;
    load();
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 20000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [token, load]);

  const totals = useMemo(() => splitOrders(orders), [orders]);
  const q = norm(query);
  const matched = useMemo(() => (q ? orders.filter((o) => orderMatches(o, q)) : orders), [orders, q]);
  const view = useMemo(() => splitOrders(matched), [matched]);
  const { fresh, dine, delivery, tables } = view;

  // tables with an order right now, for one-tap filtering
  const activeTables = useMemo(
    () => [...new Set(orders.filter((o) => o.order_type === 'dine-in').map((o) => o.table_number))]
      .sort((a, b) => Number(a) - Number(b) || String(a).localeCompare(String(b))),
    [orders],
  );

  // while searching, show the section that actually has results
  useEffect(() => {
    if (!q) return;
    if (section === 'dine-in' && dine.length === 0 && delivery.length > 0) setSection('delivery');
    else if (section === 'delivery' && delivery.length === 0 && dine.length > 0) setSection('dine-in');
  }, [q, dine.length, delivery.length, section]);

  useEffect(() => {
    document.title = totals.fresh.length > 0 ? `(${totals.fresh.length}) طلبات جديدة | الكاشير` : 'الكاشير | MOMO CLUB';
  }, [totals.fresh.length]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const acknowledge = async (id) => {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/cashier/orders/${id}/ack/`, { method: 'POST', headers: { Authorization: `Token ${token}` } });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) flash('تعذرت الموافقة على الطلب، حاول مرة أخرى');
      await load();
    } catch {
      flash('انقطع الاتصال، لم تتم الموافقة');
    } finally {
      setBusyId(null);
    }
  };

  if (!token) return <Login onLogin={(t) => { localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;

  return (
    <div className="cashier-app" dir="rtl">
      <header className="c-topbar">
        <div className="c-brand">
          <img src="/logo.jpg" alt="" className="cashier-logo sm" />
          <div>
            <div className="c-brand-name">MOMO CLUB</div>
            <div className="c-brand-sub">شاشة الكاشير</div>
          </div>
        </div>
        <div className={`c-live ${online ? 'on' : 'off'}`} role="status">
          <i aria-hidden="true" />
          {online ? `متصل، آخر تحديث ${updatedAt ? clock(updatedAt) : ''}` : 'انقطع الاتصال، نحاول مجددًا'}
        </div>
        <div className="c-tools">
          <button className={`cashier-btn cashier-btn-ghost ${soundOn ? 'is-on' : ''}`} onClick={toggleSound} aria-pressed={soundOn}>
            {soundOn ? 'التنبيه الصوتي: يعمل' : 'تفعيل التنبيه الصوتي'}
          </button>
          <button className="cashier-btn cashier-btn-ghost" onClick={logout}>خروج</button>
        </div>
      </header>

      {banner && <div className="c-banner" role="alert">{banner}</div>}
      {!online && loaded && <div className="c-offline">البيانات المعروضة قد لا تكون محدّثة.</div>}

      {!loaded ? (
        <div className="c-loading">جاري تحميل الطلبات…</div>
      ) : (
        <>
          <section className="c-search" aria-label="بحث في الطلبات">
            <div className="c-search-box">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                aria-label="بحث في الطلبات"
                placeholder="ابحث برقم الطاولة أو اسم العميل أو #رقم الطلب…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
              />
              {query && <button type="button" className="c-search-clear" onClick={() => setQuery('')} aria-label="مسح البحث">×</button>}
            </div>
            {activeTables.length > 0 && (
              <div className="c-table-chips" role="group" aria-label="الطاولات الحالية">
                <span>الطاولات:</span>
                {activeTables.map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={q === String(t) ? 'on' : ''}
                    aria-pressed={q === String(t)}
                    onClick={() => setQuery(q === String(t) ? '' : String(t))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {q && (
              <div className="c-search-result" role="status">
                {matched.length > 0 ? `${matched.length} ${matched.length === 1 ? 'نتيجة' : 'نتائج'} لـ «${query.trim()}»` : `لا توجد نتائج لـ «${query.trim()}»`}
                <button type="button" onClick={() => setQuery('')}>مسح البحث</button>
              </div>
            )}
          </section>

          <section className="c-stats" aria-label="ملخص الطلبات">
            <div className="stat s-new"><strong>{totals.fresh.length}</strong><span>جديد</span></div>
            <div className="stat"><strong>{totals.dine.length}</strong><span>داخل المطعم</span></div>
            <div className="stat"><strong>{totals.delivery.length}</strong><span>ديليفري</span></div>
          </section>

          {fresh.length > 0 && (
            <section className="c-new" aria-label="طلبات جديدة">
              <h2 className="c-col-title is-new-title">طلبات جديدة <span>{fresh.length}</span></h2>
              <div className="c-new-grid">
                {fresh.map((o) => (
                  <OrderCard key={o.id} order={o} now={now} busy={busyId === o.id} showType retention={retention} onAck={acknowledge} />
                ))}
              </div>
            </section>
          )}

          {orders.length === 0 && <p className="c-empty c-empty-all">لا توجد طلبات حاليًا. الطلبات الجديدة تظهر هنا تلقائيًا.</p>}

          <div className="c-seg" role="tablist" aria-label="القسم">
            <button className={section === 'dine-in' ? 'on' : ''} onClick={() => setSection('dine-in')}>داخل المطعم <b>{dine.length}</b></button>
            <button className={section === 'delivery' ? 'on' : ''} onClick={() => setSection('delivery')}>ديليفري <b>{delivery.length}</b></button>
          </div>

          <main className="c-board">
            <section className={`c-col ${section === 'dine-in' ? '' : 'hide-m'}`} aria-label="داخل المطعم">
              <h2 className="c-col-title">داخل المطعم <span>{dine.length}</span></h2>
              {dine.length === 0 && <p className="c-empty">لا توجد طلبات.</p>}
              {tables.map(([table, list]) => (
                <div className="table-group" key={table}>
                  <div className="table-head">
                    <span className="table-no">طاولة {table}</span>
                    <span>{list.length > 1 ? `${list.length} طلبات` : 'طلب واحد'}</span>
                    <strong>{money(list.reduce((sum, o) => sum + Number(o.total), 0))}</strong>
                  </div>
                  {list.map((o) => <OrderCard key={o.id} order={o} now={now} busy={false} retention={retention} onAck={acknowledge} />)}
                </div>
              ))}
            </section>

            <section className={`c-col ${section === 'delivery' ? '' : 'hide-m'}`} aria-label="ديليفري">
              <h2 className="c-col-title">ديليفري <span>{delivery.length}</span></h2>
              {delivery.length === 0 && <p className="c-empty">لا توجد طلبات.</p>}
              {delivery.map((o) => <OrderCard key={o.id} order={o} now={now} busy={false} retention={retention} onAck={acknowledge} />)}
            </section>
          </main>

          <p className="c-footnote">تُحذف الطلبات تلقائيًا بعد {retention === 60 ? 'ساعة' : `${retention} دقيقة`} من الموافقة عليها.</p>
        </>
      )}
    </div>
  );
}
