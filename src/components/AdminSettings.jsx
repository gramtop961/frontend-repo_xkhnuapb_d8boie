import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');

  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [message, setMessage] = useState('');

  const backendURL = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('va_admin_api') || '{}');
    if (saved.endpoint) setEndpoint(saved.endpoint);
    if (saved.key) setKey(saved.key);
  }, []);

  async function attemptAuth(e) {
    e.preventDefault();
    // Simple client-side gate; for production use real auth server-side
    if (password === (import.meta.env.VITE_ADMIN_PASSWORD || 'admin123')) {
      setAuthed(true);
    } else {
      setMessage('Invalid password');
    }
  }

  function saveApiConfig(e) {
    e.preventDefault();
    localStorage.setItem('va_admin_api', JSON.stringify({ endpoint, key }));
    setMessage('API settings saved.');
  }

  async function addItem(e) {
    e.preventDefault();
    const item = {
      ProductName: name,
      Category: category,
      ProductImage: imageUrl,
    };
    setMessage('');
    try {
      if (backendURL) {
        const res = await fetch(`${backendURL}/catalog`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to add');
      }
      setCatalog((c) => [item, ...c]);
      setName('');
      setCategory('');
      setImageUrl('');
      setMessage('Item added.');
    } catch (e) {
      setMessage('Could not add item.');
    }
  }

  async function loadCatalog() {
    setMessage('');
    if (!backendURL) return;
    try {
      const res = await fetch(`${backendURL}/catalog`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCatalog(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage('Failed to load catalog.');
    }
  }

  if (!authed) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white px-6">
        <form
          onSubmit={attemptAuth}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-gray-900">Admin Access</h1>
          <p className="mt-1 text-sm text-gray-600">Enter the admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Password"
            aria-label="Admin password"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue
          </button>
          {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage API configuration and clothing catalog.</p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={saveApiConfig} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">AI API Configuration</h2>
            <label className="block mt-3 text-sm text-gray-700">API Endpoint URL</label>
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/tryon"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <label className="block mt-3 text-sm text-gray-700">API Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="mt-4 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500"
            >
              Save Settings
            </button>
          </form>

          <form onSubmit={addItem} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Add Catalog Item</h2>
            <label className="block mt-3 text-sm text-gray-700">Product Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Royal Blue Banarasi Saree"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <label className="block mt-3 text-sm text-gray-700">Category (comma separated)</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Women,Saree"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <label className="block mt-3 text-sm text-gray-700">Product Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add Item
            </button>
            {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Catalog</h2>
            <button
              onClick={loadCatalog}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {catalog.map((item, idx) => (
              <div key={(item.id || item._id || idx) + ''} className="rounded-md border border-gray-200 overflow-hidden bg-white">
                <img src={item.ProductImage} alt={item.ProductName} className="h-40 w-full object-cover" />
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.ProductName}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{item.Category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
