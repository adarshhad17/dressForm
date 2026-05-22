import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import heroBg from '../assets/women.avif';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api/entries`;
const OPTIONS_API = `${API_BASE}/api/options`;

const initialForm = {
  full_name: '', email: '', phone: '', location: '', age: '',
  dress_type: [], dress_size: '', preferred_styles: [],
  favorite_colors: '', budget_range: '', wear_category: [],
  pattern_type: [], material: [], app_name_suggestion: '', notes: '',
};

const inputCls =
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-outfit text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 placeholder:text-gray-400';
const labelCls =
  'text-xs font-semibold uppercase tracking-wider text-violet-600';

export default function Form() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [options, setOptions] = useState({
    dress_type: [], dress_size: [], style: [], budget: [], wear_category: [], color: [],
    pattern_type: [], material: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    axios.get(OPTIONS_API)
      .then((res) => setOptions(res.data.options || {}))
      .catch(() => {})
      .finally(() => setOptionsLoading(false));
  }, []);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Multi-select toggle with max limit
  const toggleMulti = (field, value, max) => {
    setForm((prev) => {
      const current = prev[field] || [];
      if (current.includes(value)) return { ...prev, [field]: current.filter(v => v !== value) };
      if (current.length >= max) return prev; // max reached, do nothing
      return { ...prev, [field]: [...current, value] };
    });
  };

  const toggleStyle = (style) => toggleMulti('preferred_styles', style, 3);

  const toggleColor = (color) => {
    setForm((prev) => {
      const current = prev.favorite_colors ? prev.favorite_colors.split(', ').filter(Boolean) : [];
      if (current.includes(color)) return { ...prev, favorite_colors: current.filter(c => c !== color).join(', ') };
      if (current.length >= 5) return prev;
      return { ...prev, favorite_colors: [...current, color].join(', ') };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return showToast('Please enter your name.');
    if (!form.email.trim()) return showToast('Please enter your email.');
    setLoading(true);
    try {
      // Serialize array fields to comma-separated strings for the API
      const payload = {
        ...form,
        dress_type: Array.isArray(form.dress_type) ? form.dress_type.join(', ') : form.dress_type,
        wear_category: Array.isArray(form.wear_category) ? form.wear_category.join(', ') : form.wear_category,
        pattern_type: Array.isArray(form.pattern_type) ? form.pattern_type.join(', ') : form.pattern_type,
        material: Array.isArray(form.material) ? form.material.join(', ') : form.material,
      };
      await axios.post(API, payload);
      setSubmitted(true);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => { setForm(initialForm); setSubmitted(false); }, 3000);
    return () => clearTimeout(t);
  }, [submitted]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-white font-outfit flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-md bg-white border border-pink-100 rounded-2xl shadow-[0_8px_32px_rgba(236,72,153,0.12)] p-6 sm:p-10 text-center">
          <div className="flex justify-center gap-2 text-4xl mb-4">
            <span>🌸</span><span>🎉</span><span>✨</span>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your style preferences have been recorded successfully.
          </p>
          <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-pink-100 rounded-2xl px-6 py-5 mb-6 text-left space-y-2">
            <p className="text-pink-600 font-semibold text-sm">💐 Wishing you a stylish &amp; beautiful journey ahead!</p>
            <p className="text-violet-600 font-semibold text-sm">✨ May every outfit you wear make you feel confident &amp; radiant.</p>
            <p className="text-emerald-600 font-semibold text-sm">🎁 Stay tuned — you might just be our lucky winner!</p>
          </div>
          <p className="text-gray-400 text-xs mb-6">
            We'll reach out to you on WhatsApp with updates &amp; surprises.
          </p>
          <button
            className="px-7 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold text-sm rounded-xl shadow hover:opacity-90 transition"
            onClick={() => { setForm(initialForm); setSubmitted(false); }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-outfit">

      {/* Hero Banner Image — Full Screen Width */}
      <div className="relative w-full overflow-hidden mb-6 sm:mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)]" style={{height: '220px'}}>
          <img src={heroBg} alt="Women's Fashion" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 pb-6">
            {/* <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              ✨ Style Selection Form
            </div> */}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white drop-shadow-lg leading-tight">
              Tell Us Your <br className="hidden sm:block" />
              <span className="italic font-light">Style</span>
            </h2>
          </div>
        </div>

      {/* Content — constrained width */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">

        {/* Hero Text */}
        <header className="text-center mb-6 sm:mb-10">
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-4 sm:mb-5">
            Share your style preferences and we'll curate the perfect collection for you.
          </p>
          {/* Gift Winner Banner */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-2xl px-4 sm:px-6 py-3">
            <span className="text-2xl flex-shrink-0">🎁</span>
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-0.5">Lucky Winner Offer</div>
              <div className="text-sm font-semibold text-gray-700">Fill the form &amp; get a chance to win an <span className="text-pink-600">exciting gift!</span></div>
            </div>
          </div>
        </header>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-4 sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Name <span className="text-pink-500">*</span></label>
                <input id="full_name" className={inputCls} type="text" name="full_name"
                  placeholder="e.g. Priya Sharma" value={form.full_name} onChange={handleChange} required />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Email <span className="text-pink-600">*</span></label>
                <input id="email" className={inputCls} type="email" name="email"
                  placeholder="e.g. priya@email.com" value={form.email} onChange={handleChange} required />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Location / Place</label>
                <input id="location" className={inputCls} type="text" name="location"
                  placeholder="e.g. Mumbai, Delhi..." value={form.location} onChange={handleChange} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Phone</label>
                <input id="phone" className={inputCls} type="tel" name="phone"
                  placeholder="e.g. +91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Age</label>
                <input id="age" className={inputCls} type="number" name="age"
                  placeholder="e.g. 25" min="10" max="100" value={form.age} onChange={handleChange} />
              </div>

              {/* Category (Wear Occasion) */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Category <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 2)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.wear_category || []).map(({ id, value }) => {
                        const selected = form.wear_category.includes(value);
                        const maxed = !selected && form.wear_category.length >= 2;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleMulti('wear_category', value, 2)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Material */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Material <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.material || []).map(({ id, value }) => {
                        const selected = form.material.includes(value);
                        const maxed = !selected && form.material.length >= 5;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleMulti('material', value, 5)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Dress Type */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Dress Type <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.dress_type || []).map(({ id, value }) => {
                        const selected = form.dress_type.includes(value);
                        const maxed = !selected && form.dress_type.length >= 5;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleMulti('dress_type', value, 5)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Pattern Type */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Pattern Type <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.pattern_type || []).map(({ id, value }) => {
                        const selected = form.pattern_type.includes(value);
                        const maxed = !selected && form.pattern_type.length >= 5;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleMulti('pattern_type', value, 5)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Dress Size */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Dress Size</label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="h-9 w-12 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.dress_size || []).map(({ id, value }) => {
                        const selected = form.dress_size === value;
                        return (
                          <button key={id} type="button"
                            onClick={() => setForm((prev) => ({ ...prev, dress_size: selected ? '' : value }))}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Preferred Styles */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Preferred Style <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 3)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="h-9 w-20 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.style || []).map(({ id, value }) => {
                        const checked = form.preferred_styles.includes(value);
                        const maxed = !checked && form.preferred_styles.length >= 3;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleStyle(value)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${checked ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {checked ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Favorite Colors */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Favorite Colors <span className="text-gray-400 font-normal normal-case tracking-normal">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="h-9 w-16 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.color || []).map(({ id, value }) => {
                        const selected = (form.favorite_colors || '').split(', ').filter(Boolean).includes(value);
                        const maxed = !selected && (form.favorite_colors || '').split(', ').filter(Boolean).length >= 5;
                        return (
                          <button key={id} type="button" disabled={maxed}
                            onClick={() => toggleColor(value)}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : maxed ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Budget Range</label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="h-9 w-28 bg-gray-100 rounded-full animate-pulse" />)
                    : (options.budget || []).map(({ id, value }) => {
                        const selected = form.budget_range === value;
                        return (
                          <button key={id} type="button"
                            onClick={() => setForm((prev) => ({ ...prev, budget_range: selected ? '' : value }))}
                            className={`px-4 py-2.5 min-h-[44px] rounded-full border text-sm cursor-pointer select-none transition font-medium
                              ${selected ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'}`}>
                            {selected ? '✓ ' : ''}{value}
                          </button>
                        );
                      })
                  }
                </div>
              </div>

              {/* 🎁 Winner Gift Banner */}
              <div className="col-span-full bg-green-50 border border-green-500 rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
                <span className="text-3xl mt-0.5">🎁</span>
                <div>
                  <div className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-1">Lucky Winner Reward</div>
                  <p className="text-gray-600 text-sm font-medium">
                    One lucky winner from all submissions will receive an <span className="text-pink-400 font-bold">exciting gift &amp; special offer</span> — just for sharing your style! 🌸
                  </p>
                  <p className="text-gray-400 text-xs mt-1.5">Winners will be announced and notified via whatsapp.</p>
                </div>
              </div>

              {/* App Name Suggestion */}
              <div className="col-span-full flex flex-col gap-2">
                <label htmlFor="app_name_suggestion" className={labelCls}>
                  <span className="text-green-600 font-bold">💡 Name Our App!</span>
                  <span className="text-pink-600 font-normal normal-case tracking-normal ml-1">— best name wins a surprise gift 🎁</span>
                </label>
                <input
                  id="app_name_suggestion"
                  type="text"
                  name="app_name_suggestion"
                  placeholder="e.g. zara, zudio..."
                  value={form.app_name_suggestion}
                  onChange={handleChange}
                  className={inputCls}
                
                />
              </div>


              {/* Notes */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Additional Notes</label>
                <textarea id="notes" className={inputCls + ' resize-y min-h-[100px]'} name="notes"
                  placeholder="Any special preferences, occasions, or requirements..."
                  value={form.notes} onChange={handleChange} />
              </div>

              {/* Submit */}
              <div className="col-span-full">
                <button
                  id="submit-form-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-bold text-base rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : '🌸 Submit Preferences'}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* Admin link */}
        <div className="text-center mt-6">
          <Link to="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-semibold hover:border-gray-400 transition">
            ⚙️ Admin Panel
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-4 right-4 sm:bottom-7 sm:left-auto sm:right-7 sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm z-50 animate-slide-up shadow-lg text-center sm:text-left
          ${toast.type === 'error'
            ? 'bg-red-950 border border-red-400 text-red-400'
            : 'bg-green-950 border border-green-400 text-green-400'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
