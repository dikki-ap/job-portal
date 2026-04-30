import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider, useBranding } from './contexts/BrandingContext';
import { AppRouter } from './router';

function AppLoader() {
  const { isLoading } = useBranding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-[#004181] animate-spin" />
          <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <BrandingProvider>
          <AppLoader />
        </BrandingProvider>
      </BrowserRouter>
    </Provider>
  );
}
