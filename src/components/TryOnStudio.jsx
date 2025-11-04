import { useEffect, useMemo, useRef, useState } from 'react';

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'Women', label: 'Women' },
  { key: 'Men', label: 'Men' },
  { key: 'Saree', label: 'Sarees' },
  { key: 'Kurta', label: 'Kurtas' },
  { key: 'Lehenga', label: 'Lehengas' },
  { key: 'Sherwani', label: 'Sherwanis' },
];

const sampleCatalog = [
  {
    id: '1',
    ProductName: 'Royal Blue Banarasi Saree',
    Category: 'Women,Saree',
    ProductImage:
      'https://images.unsplash.com/photo-1593032465175-8f3c6f2d35eb?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    ProductName: 'Ivory Silk Sherwani',
    Category: 'Men,Sherwani',
    ProductImage:
      'https://images.unsplash.com/photo-1588361861056-8cb9220e60b6?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    ProductName: 'Emerald Green Kurta',
    Category: 'Men,Kurta',
    ProductImage:
      'https://images.unsplash.com/photo-1583391733956-6c7822b92c49?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '4',
    ProductName: 'Crimson Bridal Lehenga',
    Category: 'Women,Lehenga',
    ProductImage:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1200&auto=format&fit=crop',
  },
];

function classNames(...c) {
  return c.filter(Boolean).join(' ');
}

function useHashParam() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

async function compressImage(file, maxW = 900, quality = 0.82) {
  const img = document.createElement('img');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = dataUrl;
  });
  const scale = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
}

export default function TryOnStudio() {
  const [catalog, setCatalog] = useState(sampleCatalog);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL || '';
  const adminApi = JSON.parse(localStorage.getItem('va_admin_api') || '{}');
  const tryOnEndpoint = adminApi.endpoint || (backendURL ? backendURL + '/tryon' : '');
  const apiKey = adminApi.key || '';

  useEffect(() => {
    let active = true;
    async function loadCatalog() {
      if (!backendURL) return; // stay with sample if backend not configured
      try {
        const res = await fetch(`${backendURL}/catalog`);
        if (!res.ok) throw new Error('Failed to load catalog');
        const data = await res.json();
        if (active && Array.isArray(data)) setCatalog(data);
      } catch (e) {
        // keep sample catalog on error
      }
    }
    loadCatalog();
    return () => {
      active = false;
    };
  }, [backendURL]);

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCategory =
        filter === 'All' || item.Category?.split(',').includes(filter);
      const matchesQuery = item.ProductName.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [catalog, filter, query]);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please upload a .jpg or .png image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please upload a file under 10MB.');
      return;
    }
    setError('');
    setUserFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  async function captureFromCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setError('Camera access denied. Please upload a photo instead.');
    }
  }

  async function snapPhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
    setUserFile(file);
    setPreviewUrl(URL.createObjectURL(blob));
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  async function submitTryOn() {
    if (!userFile || !selectedProduct) {
      setError('Please upload a photo and select a product.');
      return;
    }
    setError('');
    setLoading(true);
    setShowResult(true);
    setResultUrl('');
    try {
      const photo = await compressImage(userFile);
      const form = new FormData();
      form.append('photo', photo);
      form.append('productImageUrl', selectedProduct.ProductImage);

      let res;
      if (tryOnEndpoint) {
        res = await fetch(tryOnEndpoint, {
          method: 'POST',
          headers: apiKey ? { 'x-api-key': apiKey } : undefined,
          body: form,
        });
        if (!res.ok) throw new Error('AI API request failed');
        const data = await res.json();
        if (!data || !data.imageUrl) throw new Error('Invalid AI response');
        setResultUrl(data.imageUrl);
      } else {
        // Fallback: simulate processing
        await new Promise((r) => setTimeout(r, 1800));
        setResultUrl(selectedProduct.ProductImage);
      }
    } catch (e) {
      setError('Could not generate try-on. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'tryon.jpg';
    a.click();
  }

  function shareImage() {
    if (navigator.share && resultUrl) {
      navigator
        .share({ title: 'My Virtual Try-On', url: resultUrl })
        .catch(() => {});
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Upload / Camera */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Your Photo</h2>
            <p className="text-sm text-gray-600 mt-1">For best results, use a full-body photo with good lighting.</p>
            <div className="mt-4 flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={onFileChange}
                className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-yellow-100 file:px-4 file:py-2 file:text-yellow-700 hover:file:bg-yellow-200"
                aria-label="Upload your photo as .jpg or .png"
              />
              <button
                onClick={captureFromCamera}
                className="inline-flex items-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Use Camera
              </button>
              <button
                onClick={snapPhoto}
                className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Snap
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No photo selected</span>
                )}
              </div>
              <div className="aspect-[3/4] bg-black/5 rounded-lg overflow-hidden border border-gray-200">
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
              </div>
            </div>
          </div>

          {/* Right: Catalog */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Choose an Outfit</h2>
              <div className="flex gap-2">
                {CATEGORIES.slice(0, 3).map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setFilter(c.key)}
                    className={classNames(
                      'px-3 py-1.5 rounded-full text-sm border',
                      filter === c.key
                        ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {CATEGORIES.slice(3).map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className={classNames(
                    'px-3 py-1.5 rounded-full text-sm border',
                    filter === c.key
                      ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search outfits"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id || item._id || item.ProductName}
                  onClick={() => setSelectedProduct(item)}
                  className={classNames(
                    'group relative aspect-[3/4] rounded-lg overflow-hidden border',
                    selectedProduct?.ProductName === item.ProductName
                      ? 'border-yellow-500'
                      : 'border-gray-200'
                  )}
                >
                  <img
                    src={item.ProductImage}
                    alt={item.ProductName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                    <p className="text-xs text-white/90 font-medium line-clamp-2">{item.ProductName}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={submitTryOn}
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 shadow-md shadow-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Generate Try-On
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Try-On Result"
        >
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Your Virtual Try-On</h3>
              <button
                className="rounded-md px-2 py-1 text-gray-500 hover:text-gray-800"
                onClick={() => setShowResult(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-[3/4] w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
                    <p className="text-sm text-gray-600">Generating your look…</p>
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Try-On result" className="h-full w-full object-contain" />
                ) : (
                  <p className="text-sm text-gray-500">No result yet. Please retry.</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  By continuing, you agree to our privacy policy.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={submitTryOn}
                    className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Retry
                  </button>
                  <button
                    onClick={downloadImage}
                    disabled={!resultUrl}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Download Image
                  </button>
                  <button
                    onClick={shareImage}
                    disabled={!resultUrl}
                    className="rounded-md bg-yellow-400 px-4 py-2 text-sm text-gray-900 hover:bg-yellow-500 disabled:opacity-50"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
