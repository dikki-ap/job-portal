import { useState, useEffect } from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { useToast } from '../../../hooks/useToast';
import { useGetPrivacyConsentSettingQuery, useUpdatePrivacyConsentSettingMutation } from '../api/privacyConsentApi';
import { cn } from '../../../lib/utils';

export function PrivacyConsentSettingPage() {
  const { toasts, addToast, dismissToast } = useToast();
  const { data: setting, isLoading, isError } = useGetPrivacyConsentSettingQuery();
  const [updateSetting, { isLoading: saving }] = useUpdatePrivacyConsentSettingMutation();
  const [requireConsent, setRequireConsent] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (setting) {
      setRequireConsent(setting.requireConsent);
      setDirty(false);
    }
  }, [setting]);

  const handleToggle = () => {
    setRequireConsent((v) => !v);
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSetting({ requireConsent }).unwrap();
      setDirty(false);
      addToast('Settings saved successfully.', 'success');
    } catch {
      addToast('Failed to save settings.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  if (isError) return <ErrorBanner message="Failed to load privacy consent settings." />;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Consent</h1>
        <p className="text-sm text-gray-500">
          UU PDP No. 27/2022 compliance settings — Personal Data Protection.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-gray-900">Require Consent Before Applying</h2>
          <p className="text-sm text-gray-500">
            When enabled, candidates who have not yet accepted the privacy policy will be redirected
            to the consent page before they can submit a job application.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <Shield className={cn('h-5 w-5 mt-0.5 shrink-0', requireConsent ? 'text-[var(--primary)]' : 'text-gray-400')} />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-gray-900">
                {requireConsent ? 'Enabled — Consent Required' : 'Disabled — Consent Not Required'}
              </p>
              <p className="text-xs text-gray-500">
                {requireConsent
                  ? 'Candidates must accept the privacy policy before applying.'
                  : 'Candidates can apply without confirming the privacy policy.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={requireConsent}
            onClick={handleToggle}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2',
              requireConsent ? 'bg-[var(--primary)]' : 'bg-gray-200',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                requireConsent ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        {/* Info box */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 flex flex-col gap-1">
          <p className="font-semibold">UU PDP Compliance Note:</p>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            <li>This feature supports compliance with Article 26 UU PDP (valid consent).</li>
            <li>Consent records (timestamp and status) are stored automatically per user.</li>
            <li>Disabling this feature does <span className="font-medium">not</span> delete existing consent records.</li>
          </ul>
        </div>

        {/* Link to policy page */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <p>Preview the privacy policy page shown to candidates:</p>
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-medium"
          >
            /privacy-policy <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Save */}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!dirty}
            className="bg-[var(--primary)] hover:bg-[#003268] text-white min-w-28"
          >
            Save
          </Button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
