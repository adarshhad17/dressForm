import { useState } from 'react';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL || ''}/api/entries`;

const DRESS_TYPES = ['Kurti','Saree','Lehenga','Gown','Anarkali','Suit','Salwar','Tops','Jeans','Western Dress'];
const DRESS_SIZES = ['XS','S','M','L','XL','XXL','2XL','3XL'];
const STYLES      = ['Casual','Formal','Party','Ethnic','Western','Indo-Western'];
const BUDGETS     = ['Under ₹500','₹500 – ₹1,500','₹1,500 – ₹3,000','₹3,000+'];

const inputCls =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 placeholder:text-gray-400 font-outfit';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wider text-gray-400';

export default function EditModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name:        entry.full_name || '',
    email:            entry.email || '',
    phone:            entry.phone || '',
    location:         entry.location || '',
    age:              entry.age || '',
    dress_type:       entry.dress_type || '',
    dress_size:       entry.dress_size || '',
    preferred_styles: entry.preferred_styles || [],
    favorite_colors:  entry.favorite_colors || '',
    wear_category:    entry.wear_category || '',
    pattern_type:     entry.pattern_type || '',
    material:         entry.material || '',
    app_name_suggestion: entry.app_name_suggestion || '',
    budget_range:     entry.budget_range || '',
    notes:            entry.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStyle = (style) => {
    setForm((prev) => ({
      ...prev,
      preferred_styles: prev.preferred_styles.includes(style)
        ? prev.preferred_styles.filter((s) => s !== style)
        : [...prev.preferred_styles, style],
    }));
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return setError('Name is required.');
    if (!form.email.trim())     return setError('Email is required.');
    setLoading(true);
    setError('');
    try {
      const res = await axios.put(`${API}/${entry.id}`, form);
      onSaved(res.data.entry);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-modal">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">✏️ Edit Entry</h2>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-sm hover:bg-red-50 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Name <span className="text-pink-500">*</span></label>
            <input className={inputCls} type="text" name="full_name" value={form.full_name} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Email <span className="text-pink-500">*</span></label>
            <input className={inputCls} type="email" name="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Phone</label>
            <input className={inputCls} type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Location / Place</label>
            <input className={inputCls} type="text" name="location" placeholder="e.g. Mumbai, Delhi..." value={form.location} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Age</label>
            <input className={inputCls} type="number" name="age" value={form.age} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Dress Type</label>
            <select className={inputCls + ' cursor-pointer'} name="dress_type" value={form.dress_type} onChange={handleChange}>
              <option value="">Select type...</option>
              {DRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Dress Size</label>
            <select className={inputCls + ' cursor-pointer'} name="dress_size" value={form.dress_size} onChange={handleChange}>
              <option value="">Select size...</option>
              {DRESS_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-full">
            <label className={labelCls}>Preferred Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => {
                const checked = form.preferred_styles.includes(style);
                return (
                  <label key={style}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full border text-xs cursor-pointer select-none transition font-medium
                      ${checked
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}>
                    <input type="checkbox" className="hidden"
                      id={`edit_style_${style}`} checked={checked} onChange={() => toggleStyle(style)} />
                    {checked ? '✓ ' : ''}{style}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Favorite Colors</label>
            <input className={inputCls} type="text" name="favorite_colors" value={form.favorite_colors} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Budget Range</label>
            <select className={inputCls + ' cursor-pointer'} name="budget_range" value={form.budget_range} onChange={handleChange}>
              <option value="">Select budget...</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 col-span-full">
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls + ' resize-y min-h-[80px]'} name="notes" value={form.notes} onChange={handleChange} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end px-8 py-5 border-t border-gray-100">
          <button onClick={onClose} disabled={loading}
            className="px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50">
            Cancel
          </button>
          <button id="modal-save-btn" onClick={handleSave} disabled={loading}
            className="px-6 py-2.5 bg-pink-500 rounded-xl text-white text-sm font-bold shadow-sm hover:bg-pink-600 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
