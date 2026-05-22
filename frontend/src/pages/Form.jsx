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
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-white font-outfit sm:px-6 sm:py-16">
        <div className="w-full max-w-md bg-white border border-pink-100 rounded-2xl shadow-[0_8px_32px_rgba(236,72,153,0.12)] p-6 sm:p-10 text-center">
          <div className="flex justify-center gap-2 mb-4 text-4xl">
            <span>🌸</span><span>🎉</span><span>✨</span>
          </div>
          <h2 className="mb-2 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
            Thank You!
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Your style preferences have been recorded successfully.
          </p>
          <div className="px-6 py-5 mb-6 space-y-2 text-left border border-pink-100 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl">
            <p className="text-sm font-semibold text-pink-600">💐 Wishing you a stylish &amp; beautiful journey ahead!</p>
            <p className="text-sm font-semibold text-violet-600">✨ May every outfit you wear make you feel confident &amp; radiant.</p>
            <p className="text-sm font-semibold text-emerald-600">🎁 Stay tuned — you might just be our lucky winner!</p>
          </div>
          <p className="mb-6 text-xs text-gray-400">
            We'll reach out to you on WhatsApp with updates &amp; surprises.
          </p>
          <button
            className="py-3 text-sm font-semibold text-white transition shadow px-7 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl hover:opacity-90"
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
          <img src={heroBg} alt="Women's Fashion" className="object-cover object-top w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-6 text-center">
            {/* <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
              ✨ Style Selection Form
            </div> */}
            <h2 className="text-3xl font-extrabold leading-tight text-transparent sm:text-5xl bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white drop-shadow-lg">
              Tell Us Your <br className="hidden sm:block" />
              <span className="italic font-light">Style</span>
            </h2>
          </div>
        </div>

      {/* Content — constrained width */}
      <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6">

        {/* Hero Text */}
        <header className="mb-6 text-center sm:mb-10">
          <p className="max-w-md mx-auto mb-4 text-sm text-gray-500 sm:text-base sm:mb-5">
            Share your style preferences and we'll curate the perfect collection for you.
          </p>
          {/* Gift Winner Banner */}
          <div className="flex items-center gap-3 px-4 py-3 border bg-gradient-to-r from-violet-50 to-pink-50 border-violet-200 rounded-2xl sm:px-6">
            <span className="flex-shrink-0 text-2xl">🎁</span>
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-0.5">Lucky Winner Offer</div>
              <div className="text-sm font-semibold text-gray-700">Fill the form &amp; get a chance to win an <span className="text-pink-600">exciting gift!</span></div>
            </div>
          </div>
        </header>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-4 sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

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
                  placeholder="e.g. +91 98765 43210" value={form.phone} maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setForm((prev) => ({ ...prev, phone: val }));
                  }} />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Age</label>
                <input id="age" className={inputCls} type="number" name="age"
                  placeholder="e.g. 25" min="1" max="99" value={form.age}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setForm((prev) => ({ ...prev, age: val }));
                  }} />
              </div>

              {/* Category (Wear Occasion) */}
              <div className="flex flex-col gap-2 col-span-full">
                <label className={labelCls}>Category <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 2)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="w-24 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                <label className={labelCls}>Material <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="w-20 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                <label className={labelCls}>Dress Type <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="w-20 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                <label className={labelCls}>Pattern Type <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="w-20 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                    ? [1,2,3,4].map(i => <div key={i} className="w-12 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                <label className={labelCls}>Preferred Style <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 3)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3].map(i => <div key={i} className="w-20 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                <label className={labelCls}>Favorite Colors <span className="font-normal tracking-normal text-gray-400 normal-case">(choose up to 5)</span></label>
                <div className="flex flex-wrap gap-2.5">
                  {optionsLoading
                    ? [1,2,3,4].map(i => <div key={i} className="w-16 bg-gray-100 rounded-full h-9 animate-pulse" />)
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
                    ? [1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-full h-9 w-28 animate-pulse" />)
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

              {/* App Name Suggestion */}
              <div className="flex flex-col gap-2 col-span-full">
                <div className="flex items-start gap-3 px-4 py-4 border border-green-200 bg-gradient-to-r from-green-50 to-amber-50 rounded-2xl">
                  <span className="text-2xl mt-0.5">💡</span>
                  <div>
                    <div className="text-sm font-bold text-green-700 mb-0.5">Name Our Upcoming Women's Dress App!</div>
                    <p className="text-xs leading-relaxed text-gray-600">
                      We're launching a women's dress app — suggest a name and <span className="font-semibold text-pink-600">win an exciting offer &amp; gift!</span> The best name gets a special reward. 🎁
                    </p>
                  </div>
                </div>
                <label htmlFor="app_name_suggestion" className={labelCls}>
                  <span className="font-bold text-green-600">Your Suggestion</span>
                  <span className="ml-1 font-normal tracking-normal text-pink-600 normal-case">— Your name could be on our app & a gift on us! 🎁</span>
                </label>
                <input
                  id="app_name_suggestion"
                  type="text"
                  name="app_name_suggestion"
                  placeholder="e.g. Zara, Zudio, StyleBloom..."
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
                  className="w-full py-4 bg-pink-600 text-white font-bold text-base rounded-xl shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : '🌸 Submit Preferences'}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* Admin link */}
        <div className="mt-6 text-center">
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
