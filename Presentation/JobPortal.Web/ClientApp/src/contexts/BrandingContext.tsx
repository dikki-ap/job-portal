import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface BrandingConfig {
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

const defaults: BrandingConfig = {
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

const BrandingContext = createContext<BrandingConfig>(defaults);

function applyColors(b: BrandingConfig) {
  const r = document.documentElement;
  r.style.setProperty('--primary', b.primaryColor);
  r.style.setProperty('--primary-hover', b.primaryHoverColor);
  r.style.setProperty('--gradient-mid', b.gradientMidColor);
  r.style.setProperty('--gradient-end', b.gradientEndColor);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaults);

  useEffect(() => {
    fetch('/api/app-settings/branding')
      .then((r) => r.json())
      .then((data: BrandingConfig) => {
        setBranding(data);
        applyColors(data);
      })
      .catch(() => {
        applyColors(defaults);
      });
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export const useBranding = () => useContext(BrandingContext);
