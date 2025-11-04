import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import TryOnStudio from './components/TryOnStudio.jsx';
import AdminSettings from './components/AdminSettings.jsx';

function useRoute() {
  const getRoute = () => (window.location.hash || '#/').replace('#', '');
  const [route, setRoute] = useState(getRoute());
  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [route, (r) => (window.location.hash = r)];
}

function Header({ hidden }) {
  if (hidden) return null;
  return (
    <header className="h-16 w-full bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
        <a href="#/" className="text-lg font-bold tracking-tight text-gray-900">
          VaTryOn
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-700">
          <a href="#/" className="hover:text-gray-900">Home</a>
          <a href="#/studio" className="hover:text-gray-900">Try-On Studio</a>
        </nav>
        <a
          href="#/studio"
          className="inline-flex items-center rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
          aria-label="Start Your Virtual Try-On"
        >
          Start
        </a>
      </div>
    </header>
  );
}

export default function App() {
  const [route, setRoute] = useRoute();
  const showHeader = route !== '/studio';

  return (
    <div className="min-h-screen bg-white font-[Inter] text-gray-900">
      <Header hidden={!showHeader} />
      {route === '/' && <LandingPage onStart={() => setRoute('/studio')} />}
      {route === '/studio' && <TryOnStudio />}
      {route === '/admin-secret' && <AdminSettings />}
      {route !== '/' && route !== '/studio' && route !== '/admin-secret' && (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <a href="#/" className="mt-3 inline-block text-yellow-600 hover:underline">Return Home</a>
          </div>
        </div>
      )}
      {showHeader && (
        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600 flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
            <p>© {new Date().getFullYear()} VaTryOn — Virtual AI Try-On for Indian Ethnic Wear</p>
            <div className="flex items-center gap-4">
              <a href="#/studio" className="hover:text-gray-900">Try-On Studio</a>
              <a href="#/admin-secret" className="hover:text-gray-900" aria-label="Admin">Admin</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
