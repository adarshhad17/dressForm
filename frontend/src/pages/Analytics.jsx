import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = `${import.meta.env.VITE_API_URL || ''}/api/entries/analytics`;

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

const COLORS = [
  'bg-violet-500', 'bg-pink-500', 'bg-amber-400',
  'bg-teal-500',   'bg-blue-500', 'bg-rose-500',
  'bg-emerald-500','bg-orange-500','bg-purple-500',
];

function InsightTable({ icon, label, data }) {
  const max = data[0]?.count || 1;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
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
            const bar = COLORS[i % COLORS.length];
            return (
              <div key={value} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${bar}`}>
                  {i + 1}
                </span>
                {/* Name */}
                <span className="text-sm text-gray-700 font-medium flex-1 truncate">{value}</span>
                {/* Bar */}
                <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
                </div>
                {/* Count */}
                <span className="text-sm font-bold text-gray-800 w-6 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    axios.get(API)
      .then(res => {
        setData(res.data.analytics);
        setTotal(res.data.total);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-gray-400 hover:text-gray-700 transition text-lg">←</Link>
          <div>
            <h1 className="font-extrabold text-gray-900 text-base leading-tight">Demand Insights</h1>
            <p className="text-xs text-gray-400">What customers want — sorted by popularity</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-4 py-2">
          <span className="text-violet-600 text-lg">📊</span>
          <div className="text-left">
            <div className="text-[11px] text-violet-500 font-semibold uppercase tracking-wider">Total Responses</div>
            <div className="text-xl font-extrabold text-violet-700 leading-none">{total}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
        )}

        {data && (
          <>
            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(data).map(([key, { label, data: d }]) => (
                <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                  <span>{ICONS[key]}</span>{label}
                  <span className="bg-violet-100 text-violet-600 rounded-full px-1.5 py-0 font-bold">{d.length}</span>
                </span>
              ))}
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(data).map(([key, { label, data: d }]) => (
                <InsightTable key={key} icon={ICONS[key]} label={label} data={d} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
