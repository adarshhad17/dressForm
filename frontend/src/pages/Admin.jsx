import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import EditModal from '../components/EditModal';

const API_BASE    = import.meta.env.VITE_API_URL || '';
const API         = `${API_BASE}/api/entries`;
const OPTIONS_API = `${API_BASE}/api/options`;

const CATEGORIES = [
  { key: 'dress_type',    label: 'Dress Types',       icon: '👗' },
  { key: 'dress_size',   label: 'Dress Sizes',        icon: '📏' },
  { key: 'style',        label: 'Preferred Styles',   icon: '✨' },
  { key: 'budget',       label: 'Budget Ranges',      icon: '💰' },
  { key: 'wear_category', label: 'Categories',        icon: '🏷️' },
  { key: 'color',        label: 'Favorite Colors',    icon: '🎨' },
  { key: 'pattern_type', label: 'Pattern Types',      icon: '🧩' },
  { key: 'material',     label: 'Materials',          icon: '🧵' },
];

const INSIGHT_COLORS = [
  'bg-violet-500','bg-pink-500','bg-amber-400','bg-teal-500',
  'bg-blue-500','bg-rose-500','bg-emerald-500','bg-orange-500',
];

const ICONS = {
  category:     '🏷️',
  dress_type:   '👗',
  material:     '🧵',
  pattern_type: '🧩',
  dress_size:   '📏',
  style:        '✨',
  color:        '🎨',
  budget:       '💰',
  app_name:     '💡',
};

function InsightTable({ icon, label, data }) {
  const max = data[0]?.count || 1;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
        <span className="ml-auto text-xs text-gray-400 font-medium">{data.length} option{data.length !== 1 ? 's' : ''}</span>
      </div>
      {data.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">No data yet</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.map(({ value, count }, i) => {
            const pct = Math.round((count / max) * 100);
            const bar = INSIGHT_COLORS[i % INSIGHT_COLORS.length];
            return (
              <div key={value} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${bar}`}>{i + 1}</span>
                <span className="text-sm text-gray-700 font-medium flex-1 truncate">{value}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-800 w-5 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DemandCard({ icon, label, data }) {
  const max = data[0]?.count || 1;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-base">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <div className="space-y-2">
        {data.slice(0, 3).map(({ value, count }, i) => {
          const pct = Math.round((count / max) * 100);
          const isTop = i === 0;
          return (
            <div key={value}>
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-semibold truncate flex-1 ${isTop ? 'text-gray-800' : 'text-gray-500'}`}>{value}</span>
                <span className={`text-xs font-bold ml-2 shrink-0 ${isTop ? 'text-pink-600' : 'text-gray-400'}`}>{count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isTop ? 'bg-pink-500' : 'bg-gray-300'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 placeholder:text-gray-400 font-outfit';

export default function Admin() {
  const navigate = useNavigate();

  // Entries
  const [entries,     setEntries]    = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [editEntry,   setEditEntry]  = useState(null);
  const [search,      setSearch]     = useState('');
  const [filterType,  setFilterType] = useState('');
  const [filterSize,  setFilterSize] = useState('');

  // Options
  const [options,   setOptions]   = useState({});
  const [newValue,  setNewValue]  = useState({});
  const [addingFor, setAddingFor] = useState(null);

  // UI
  const [activeTab,    setActiveTab]    = useState('entries');
  const [sidebarOpen,  setSidebarOpen]  = useState(false); // mobile
  const [toast,        setToast]        = useState(null);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/login');
  };

  // ─── Entries ────────────────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setEntries(res.data.entries);
    } catch {
      showToast('Failed to load entries.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete entry for "${name}"?`)) return;
    try {
      await axios.delete(`${API}/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast(`"${name}" deleted.`);
    } catch {
      showToast('Failed to delete.', 'error');
    }
  };

  const handleSaved = (updated) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditEntry(null);
    showToast('Entry updated ✅');
  };

  // ─── Options ────────────────────────────────────────────────────────────────
  const fetchOptions = useCallback(async () => {
    try {
      const res = await axios.get(OPTIONS_API);
      setOptions(res.data.options || {});
    } catch {
      showToast('Failed to load options.', 'error');
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleAddOption = async (category) => {
    const val = (newValue[category] || '').trim();
    if (!val) return;
    try {
      const res = await axios.post(OPTIONS_API, { category, value: val });
      setOptions((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), res.data.option],
      }));
      setNewValue((prev) => ({ ...prev, [category]: '' }));
      setAddingFor(null);
      showToast(`"${val}" added ✅`);
    } catch {
      showToast('Failed to add option.', 'error');
    }
  };

  const handleDeleteOption = async (category, id, value) => {
    if (!window.confirm(`Remove "${value}"?`)) return;
    try {
      await axios.delete(`${OPTIONS_API}/${id}`);
      setOptions((prev) => ({
        ...prev,
        [category]: prev[category].filter((o) => o.id !== id),
      }));
      showToast(`"${value}" removed`);
    } catch {
      showToast('Failed to remove option.', 'error');
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function topOf(rows, field) {
    const counts = {};
    rows.forEach(e => {
      const val = e[field];
      if (!val) return;
      const items = Array.isArray(val)
        ? val
        : String(val).split(',').map(v => v.trim()).filter(Boolean);
      items.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
  }

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.full_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.includes(q);
    return matchSearch &&
      (!filterType || e.dress_type === filterType) &&
      (!filterSize || e.dress_size === filterSize);
  });

  const typeCounts = entries.reduce((acc, e) => {
    if (e.dress_type) acc[e.dress_type] = (acc[e.dress_type] || 0) + 1;
    return acc;
  }, {});
  const topType    = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const uniqueTypes = [...new Set(entries.map((e) => e.dress_type).filter(Boolean))];
  const uniqueSizes = [...new Set(entries.map((e) => e.dress_size).filter(Boolean))];

  const demandSnapshot = [
    { icon: '👗', label: 'Dress Type',   data: topOf(entries, 'dress_type') },
    { icon: '📏', label: 'Size',          data: topOf(entries, 'dress_size') },
    { icon: '🏷️', label: 'Category',      data: topOf(entries, 'wear_category') },
    { icon: '🧵', label: 'Material',      data: topOf(entries, 'material') },
    { icon: '🧩', label: 'Pattern',       data: topOf(entries, 'pattern_type') },
    { icon: '✨', label: 'Style',          data: topOf(entries, 'preferred_styles') },
    { icon: '🎨', label: 'Color',         data: topOf(entries, 'favorite_colors') },
    { icon: '💰', label: 'Budget',        data: topOf(entries, 'budget_range') },
  ].filter(d => d.data.length > 0);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ─── NAV items ───────────────────────────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const navItems = [
    { id: 'entries',   label: 'Submissions',    icon: '📋' },
    { id: 'options',   label: 'Manage Options', icon: '⚙️' },
    { id: 'analytics', label: 'Demand Insights', icon: '📊' },
  ];

  // Fetch analytics when tab is opened
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    setAnalyticsLoading(true);
    axios.get(`${API}/analytics`)
      .then(res => setAnalyticsData(res.data.analytics))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, [activeTab]);

  // ─── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm">🌸</div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-none">Dress Form</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
              ${activeTab === id
                ? id === 'analytics' ? 'bg-violet-50 text-violet-700 font-semibold' : 'bg-pink-50 text-pink-700 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            <span>{icon}</span>
            {label}
            {id === 'entries' && (
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
                ${activeTab === id ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
                {entries.length}
              </span>
            )}
            {id === 'analytics' && activeTab !== 'analytics' && (
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">NEW</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">
          ← Back to Form
        </Link>
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-outfit flex">

      {/* ── Sidebar (desktop) ── */}
      <div className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed top-0 left-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-900">
              {activeTab === 'entries' ? '📋 Submissions' : activeTab === 'options' ? '⚙️ Manage Options' : '📊 Demand Insights'}
            </h1>
          </div>
          <button
            id="admin-refresh-btn"
            onClick={fetchEntries}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-xs font-semibold hover:border-gray-300 transition"
          >
            🔄 Refresh
          </button>
        </header>

        {/* Stats */}
        <div className="px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries',     value: entries.length,  color: 'text-pink-600'  },
            { label: 'Showing',           value: filtered.length, color: 'text-blue-600'  },
            { label: 'Most Popular Type', value: topType,         color: 'text-purple-600', small: true },
            { label: 'Unique Types',      value: uniqueTypes.length, color: 'text-green-600' },
          ].map(({ label, value, color, small }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{label}</div>
              <div className={`font-extrabold ${color} ${small ? 'text-base leading-snug mt-1' : 'text-3xl'}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Submissions Tab ── */}
        {activeTab === 'entries' && (
          <div className="px-6 pb-16 flex-1">

            {/* Demand Snapshot */}
            {demandSnapshot.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">📊 Demand Snapshot</span>
                  <span className="text-[10px] text-gray-300 font-medium">— top choices from {entries.length} responses</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {demandSnapshot.map(({ icon, label, data }) => (
                    <DemandCard key={label} icon={icon} label={label} data={data} />
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              <input
                id="admin-search"
                type="text"
                placeholder="🔍 Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls + ' sm:w-56'}
              />
              <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className={inputCls + ' sm:w-36'}>
                <option value="">All Types</option>
                {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select id="filter-size" value={filterSize} onChange={(e) => setFilterSize(e.target.value)}
                className={inputCls + ' sm:w-32'}>
                <option value="">All Sizes</option>
                {uniqueSizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center py-24 text-gray-400">
                <div className="w-10 h-10 border-[3px] border-gray-200 border-t-pink-500 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading entries...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <span className="text-5xl block mb-4">🗂️</span>
                <p className="text-sm">{entries.length === 0 ? 'No submissions yet.' : 'No results match your filters.'}</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['#', 'Name', 'Type', 'Size', 'Category', 'Location', 'Styles', 'Colors', 'Budget', 'Date', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((e, i) => (
                        <tr key={e.id} className="hover:bg-gray-50/60 transition">
                          <td className="px-4 py-3.5 text-gray-300 text-xs font-medium">{i + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-800">{e.full_name} {e.last_name}</div>
                            <div className="text-gray-400 text-xs">{e.email}</div>
                            {e.phone && <div className="text-gray-300 text-[11px]">{e.phone}</div>}
                          </td>
                          <td className="px-4 py-3.5">
                            {e.dress_type
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-100">{e.dress_type}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            {e.dress_size
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">{e.dress_size}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            {e.wear_category
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">{e.wear_category}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            {e.location
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-600 border border-teal-100">📍 {e.location}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            {e.preferred_styles?.length > 0
                              ? <div className="flex flex-wrap gap-1">
                                  {e.preferred_styles.map((s) => (
                                    <span key={s} className="text-[11px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{s}</span>
                                  ))}
                                </div>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs">{e.favorite_colors || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5">
                            {e.budget_range
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-600 border border-yellow-100">{e.budget_range}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 text-xs whitespace-nowrap">{formatDate(e.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex gap-2">
                              <button id={`edit-btn-${e.id}`} onClick={() => setEditEntry(e)}
                                className="px-3 py-1.5 bg-pink-50 border border-pink-200 rounded-lg text-pink-600 text-xs font-semibold hover:bg-pink-100 transition">
                                ✏️ Edit
                              </button>
                              <button id={`delete-btn-${e.id}`} onClick={() => handleDelete(e.id, e.full_name)}
                                className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-500 text-xs font-semibold hover:bg-red-100 transition">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Manage Options Tab ── */}
        {activeTab === 'options' && (
          <div className="px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {CATEGORIES.map(({ key, label, icon }) => (
              <div key={key} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {(options[key] || []).length}
                    </span>
                  </div>
                  <button
                    onClick={() => setAddingFor(addingFor === key ? null : key)}
                    className="px-3 py-1 bg-pink-500 rounded-lg text-white text-xs font-semibold hover:bg-pink-600 transition">
                    + Add
                  </button>
                </div>

                {/* Add input */}
                {addingFor === key && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder={`New ${label.toLowerCase().replace(/s$/, '')}...`}
                      value={newValue[key] || ''}
                      onChange={(e) => setNewValue((prev) => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddOption(key)}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition placeholder:text-gray-400"
                      autoFocus
                    />
                    <button onClick={() => handleAddOption(key)}
                      className="px-3 py-2 bg-pink-500 rounded-lg text-white text-xs font-bold hover:bg-pink-600 transition">✓</button>
                    <button onClick={() => setAddingFor(null)}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-gray-500 text-xs hover:bg-gray-200 transition">✕</button>
                  </div>
                )}

                {/* Options chips */}
                <div className="flex flex-wrap gap-2">
                  {(options[key] || []).length === 0 ? (
                    <p className="text-gray-400 text-xs">No options yet.</p>
                  ) : (
                    (options[key] || []).map(({ id, value }) => (
                      <div key={id}
                        className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                        {value}
                        <button
                          onClick={() => handleDeleteOption(key, id, value)}
                          className="w-4 h-4 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition text-[10px] font-bold">
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="px-6 pb-16">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
                ))}
              </div>
            ) : analyticsData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(analyticsData).map(([key, { label, data }]) => (
                  <InsightTable key={key} icon={ICONS[key] || '📊'} label={label} data={data} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <span className="text-5xl block mb-4">📊</span>
                <p className="text-sm">No analytics data available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editEntry && (
        <EditModal entry={editEntry} onClose={() => setEditEntry(null)} onSaved={handleSaved} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-7 right-7 px-5 py-3.5 rounded-xl font-semibold text-sm z-50 animate-slide-up shadow-lg
          ${toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-600'
            : 'bg-green-50 border border-green-200 text-green-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
