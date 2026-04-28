import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { AppRouter } from './router';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <BrandingProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrandingProvider>
      </BrowserRouter>
    </Provider>
  );
}
