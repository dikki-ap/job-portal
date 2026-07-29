import { useState, useEffect, useRef } from 'react';
import { Palette, Building2, ImageIcon, UploadCloud, Info, CheckCircle2, X, Globe } from 'lucide-react';
import { BrandingGate } from '../components/BrandingGate';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { useToast } from '../../../hooks/useToast';
import {
  useGetBrandingSettingQuery,
  useUpdateBrandingSettingMutation,
  useUploadBrandingLogoMutation,
} from '../api/brandingSettingsApi';
import { useBranding, defaults, type BrandingConfig } from '../../../contexts/BrandingContext';
import { cn } from '../../../lib/utils';

const COMMON_TIMEZONES = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'WIB – Jakarta (UTC+7)', value: 'Asia/Jakarta' },
  { label: 'WITA – Makassar (UTC+8)', value: 'Asia/Makassar' },
  { label: 'WIT – Jayapura (UTC+9)', value: 'Asia/Jayapura' },
  { label: 'SGT – Singapore (UTC+8)', value: 'Asia/Singapore' },
  { label: 'MYT – Kuala Lumpur (UTC+8)', value: 'Asia/Kuala_Lumpur' },
  { label: 'ICT – Bangkok (UTC+7)', value: 'Asia/Bangkok' },
  { label: 'PHT – Manila (UTC+8)', value: 'Asia/Manila' },
  { label: 'HKT – Hong Kong (UTC+8)', value: 'Asia/Hong_Kong' },
  { label: 'CST – Shanghai (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'JST – Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'KST – Seoul (UTC+9)', value: 'Asia/Seoul' },
  { label: 'IST – Kolkata (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'PKT – Karachi (UTC+5)', value: 'Asia/Karachi' },
  { label: 'AEST – Sydney (UTC+10/11)', value: 'Australia/Sydney' },
  { label: 'AWST – Perth (UTC+8)', value: 'Australia/Perth' },
  { label: 'NZST – Auckland (UTC+12/13)', value: 'Pacific/Auckland' },
  { label: 'GMT – London (UTC+0/1)', value: 'Europe/London' },
  { label: 'CET – Paris (UTC+1/2)', value: 'Europe/Paris' },
  { label: 'TRT – Istanbul (UTC+3)', value: 'Europe/Istanbul' },
  { label: 'EST – New York (UTC-5/-4)', value: 'America/New_York' },
  { label: 'CST – Chicago (UTC-6/-5)', value: 'America/Chicago' },
  { label: 'MST – Denver (UTC-7/-6)', value: 'America/Denver' },
  { label: 'PST – Los Angeles (UTC-8/-7)', value: 'America/Los_Angeles' },
  { label: 'BRT – São Paulo (UTC-3)', value: 'America/Sao_Paulo' },
];

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

type FormState = Omit<BrandingConfig, 'logoUrl'>;

export function BrandingSettingsPage() {
  const { toasts, addToast, dismissToast } = useToast();
  const { data, isLoading, isError } = useGetBrandingSettingQuery();
  const [updateBrandingSetting, { isLoading: saving }] = useUpdateBrandingSettingMutation();
  const [uploadBrandingLogo, { isLoading: uploading }] = useUploadBrandingLogoMutation();
  const { updateBranding, logoUrl: currentLogoUrl } = useBranding();

  const [form, setForm] = useState<FormState>({ ...defaults });
  const [dirty, setDirty] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUploaded, setLogoUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      const { logoUrl: _, ...rest } = data;
      setForm({ ...rest });
      setDirty(false);
    }
  }, [data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploaded(false);
  }

  function handleClearLogo() {
    setLogoFile(null);
    setLogoPreview('');
    setLogoUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    try {
      const { url } = await uploadBrandingLogo(logoFile).unwrap();
      const urlWithBust = url + '?v=' + Date.now();
      updateBranding({ ...form, logoUrl: urlWithBust });
      setLogoUploaded(true);
      setLogoFile(null);
      setLogoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast('Logo uploaded successfully.', 'success');
    } catch {
      addToast('Failed to upload logo.', 'error');
    }
  };

  const handleSave = async () => {
    try {
      await updateBrandingSetting({ ...form, logoUrl: currentLogoUrl }).unwrap();
      updateBranding({ ...form, logoUrl: currentLogoUrl });
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

  if (isError) return <ErrorBanner message="Failed to load branding settings." />;

  return (
    <BrandingGate>
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-sm text-gray-500">
          Customize colors, company identity, and contact information displayed across the portal.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <ImageIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Logo</h2>
        </div>

        {/* Hints */}
        <div className="px-6 py-4 bg-blue-50/60 flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <ul className="text-xs text-blue-800 flex flex-col gap-1">
            <li><span className="font-semibold">Accepted formats:</span> SVG or PNG only — both support transparent backgrounds</li>
            <li><span className="font-semibold">Max file size:</span> 2 MB</li>
            <li><span className="font-semibold">Recommended size:</span> minimum 128 × 128 px, square aspect ratio</li>
            <li><span className="font-semibold">Tip:</span> SVG is preferred — scales perfectly at any size without pixelation</li>
          </ul>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Current logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="h-16 w-16 object-contain" />
              ) : currentLogoUrl ? (
                <img src={currentLogoUrl} alt="Current logo" className="h-16 w-16 object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-700">
                {currentLogoUrl ? 'Current logo' : 'No logo uploaded'}
              </p>
              <p className="text-xs text-gray-400">
                {logoPreview
                  ? `Selected: ${logoFile?.name}`
                  : currentLogoUrl
                  ? 'Replaces all logo instances across the portal and favicon'
                  : 'Upload a logo to replace the default icon across the portal and favicon'}
              </p>
            </div>
          </div>

          {/* File picker + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,image/svg+xml,image/png"
              className="sr-only"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              {logoFile ? 'Change file' : 'Choose file'}
            </button>

            {logoFile && !logoUploaded && (
              <>
                <Button
                  onClick={handleUploadLogo}
                  loading={uploading}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                >
                  Upload Logo
                </Button>
                <button type="button" onClick={handleClearLogo} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </>
            )}

            {logoUploaded && (
              <span className="flex items-center gap-1.5 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded and applied
              </span>
            )}
          </div>
        </div>
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

      {/* Date & Time */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Globe className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Date & Time</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => set('timezone', e.target.value)}
            className={inputCls}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400">
            All audit trail timestamps across the app will be displayed in this timezone.
          </p>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Building2 className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Company Info</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
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
