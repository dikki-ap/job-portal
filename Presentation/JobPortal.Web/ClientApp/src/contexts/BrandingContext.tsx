import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  primaryHoverColor: string;
  gradientMidColor: string;
  gradientEndColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
}

interface BrandingContextValue extends BrandingConfig {
  isLoading: boolean;
  updateBranding: (config: BrandingConfig) => void;
}

export const defaults: BrandingConfig = {
  companyName: 'JobPortal',
  logoUrl: '',
  primaryColor: '#004181',
  primaryHoverColor: '#003166',
  gradientMidColor: '#0066cc',
  gradientEndColor: '#0080ff',
  contactEmail: 'hello@jobportal.tech',
  contactPhone: '+62 21 0000 0000',
  address: 'South Jakarta, Indonesia',
  description: 'Empowering businesses through innovative technology solutions.',
};

const BrandingContext = createContext<BrandingContextValue>({
  ...defaults,
  isLoading: true,
  updateBranding: () => {},
});

function applyBranding(b: BrandingConfig) {
  const r = document.documentElement;
  r.style.setProperty('--primary', b.primaryColor);
  r.style.setProperty('--primary-hover', b.primaryHoverColor);
  r.style.setProperty('--gradient-mid', b.gradientMidColor);
  r.style.setProperty('--gradient-end', b.gradientEndColor);

  if (b.logoUrl) {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = b.logoUrl + '?v=' + Date.now();
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaults);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    applyBranding(defaults);
    fetch('/api/app-settings/branding')
      .then((r) => r.json())
      .then((data: BrandingConfig) => {
        setBranding(data);
        applyBranding(data);
      })
      .catch(() => {
        applyBranding(defaults);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function updateBranding(config: BrandingConfig) {
    setBranding(config);
    applyBranding(config);
  }

  return (
    <BrandingContext.Provider value={{ ...branding, isLoading, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
