import { useState, useEffect } from 'react';
import { Palette, Building2 } from 'lucide-react';
import { BrandingGate } from '../components/BrandingGate';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../hooks/useToast';
import { useGetBrandingSettingQuery, useUpdateBrandingSettingMutation } from '../api/brandingSettingsApi';
import { useBranding, defaults, type BrandingConfig } from '../../../contexts/BrandingContext';
import { cn } from '../../../lib/utils';

const inputCls = cn(
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
  'outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10',
);

interface ColorFieldProps {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, fallback, onChange }: ColorFieldProps) {
  const isFallback = value === fallback;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-gray-300 p-0.5 bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          className={cn(inputCls, 'font-mono flex-1')}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="h-5 w-5 rounded border border-gray-200 shrink-0"
            style={{ backgroundColor: fallback }}
            title={`Fallback: ${fallback}`}
          />
          <span className={cn('text-xs font-mono', isFallback ? 'text-gray-400' : 'text-gray-500')}>
            {fallback}
          </span>
        </div>
      </div>
      {isFallback && (
        <p className="text-xs text-gray-400">Using fallback color</p>
      )}
    </div>
  );
}

type FormState = BrandingConfig;

export function BrandingSettingsPage() {
  const { toasts, addToast, dismissToast } = useToast();
  const { data, isLoading } = useGetBrandingSettingQuery();
  const [updateBrandingSetting, { isLoading: saving }] = useUpdateBrandingSettingMutation();
  const { updateBranding } = useBranding();

  const [form, setForm] = useState<FormState>({ ...defaults });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({ ...data });
      setDirty(false);
    }
  }, [data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  const handleSave = async () => {
    try {
      await updateBrandingSetting(form).unwrap();
      updateBranding(form);
      setDirty(false);
      addToast('Branding settings saved.', 'success');
    } catch {
      addToast('Failed to save branding settings.', 'error');
    }
  };

  if (isLoading) {
    return (
      <BrandingGate>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      </BrandingGate>
    );
  }

  return (
    <BrandingGate>
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-sm text-gray-500">
          Customize colors, company identity, and contact information displayed across the portal.
        </p>
      </div>

      {/* Colors */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Palette className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Colors</h2>
          <span className="ml-auto text-xs text-gray-400">Right swatch = fallback color if not set</span>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <ColorField
            label="Primary Color"
            value={form.primaryColor}
            fallback={defaults.primaryColor}
            onChange={(v) => set('primaryColor', v)}
          />
          <ColorField
            label="Primary Hover Color"
            value={form.primaryHoverColor}
            fallback={defaults.primaryHoverColor}
            onChange={(v) => set('primaryHoverColor', v)}
          />
          <ColorField
            label="Gradient Mid Color"
            value={form.gradientMidColor}
            fallback={defaults.gradientMidColor}
            onChange={(v) => set('gradientMidColor', v)}
          />
          <ColorField
            label="Gradient End Color"
            value={form.gradientEndColor}
            fallback={defaults.gradientEndColor}
            onChange={(v) => set('gradientEndColor', v)}
          />

          {/* Live Preview */}
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Live Preview</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: form.primaryColor }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = form.primaryHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = form.primaryColor)}
              >
                Primary Button
              </button>
              <div
                className="h-9 flex-1 min-w-48 rounded-lg"
                style={{
                  background: `linear-gradient(to right, ${form.primaryColor}, ${form.gradientMidColor}, ${form.gradientEndColor})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Building2 className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Company Info</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                placeholder={defaults.companyName}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(e) => set('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
                placeholder={defaults.contactEmail}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                placeholder={defaults.contactPhone}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder={defaults.address}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description / Tagline</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={defaults.description}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white min-w-32"
        >
          Save Changes
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
    </BrandingGate>
  );
}
