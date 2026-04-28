import { useState, useEffect } from 'react';
import { Mail, Server, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../hooks/useToast';
import { useGetSmtpSettingQuery, useUpdateSmtpSettingMutation } from '../api/smtpSettingsApi';
import { cn } from '../../../lib/utils';

const ENV_MAP: Record<string, string> = {
  host:        'SMTP_HOST',
  port:        'SMTP_PORT',
  senderName:  'SMTP_SENDER_NAME',
  senderEmail: 'SMTP_SENDER_EMAIL',
  username:    'SMTP_USERNAME',
  enableSsl:   'SMTP_ENABLE_SSL',
};

function EnvBadge({ envKey }: { envKey: string }) {
  return (
    <span
      title={`Locked by environment variable ${envKey}`}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
    >
      ENV
    </span>
  );
}

function Field({
  label, field, envOverrides, children,
}: {
  label: string;
  field: string;
  envOverrides: string[];
  children: React.ReactNode;
}) {
  const envKey = ENV_MAP[field];
  const locked = envOverrides.includes(envKey);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {locked && <EnvBadge envKey={envKey} />}
      </div>
      {children}
      {locked && (
        <p className="text-xs text-amber-700">
          Locked by <code className="font-mono">{envKey}</code>. Change it on the server to override.
        </p>
      )}
    </div>
  );
}

interface FormState {
  host: string;
  port: string;
  senderName: string;
  senderEmail: string;
  username: string;
  enableSsl: boolean;
}

const inputCls = (locked: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors',
    locked
      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'border-gray-300 bg-white focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10',
  );

export function SmtpSettingsPage() {
  const { toasts, addToast, dismissToast } = useToast();
  const { data: setting, isLoading } = useGetSmtpSettingQuery();
  const [updateSetting, { isLoading: saving }] = useUpdateSmtpSettingMutation();

  const [form, setForm] = useState<FormState>({
    host: '', port: '587', senderName: '', senderEmail: '', username: '', enableSsl: true,
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (setting) {
      setForm({
        host: setting.host,
        port: String(setting.port),
        senderName: setting.senderName,
        senderEmail: setting.senderEmail,
        username: setting.username,
        enableSsl: setting.enableSsl,
      });
      setDirty(false);
    }
  }, [setting]);

  const envOverrides = setting?.envOverrides ?? [];
  const hasEnvOverrides = envOverrides.length > 0;
  const passwordFromEnv = envOverrides.includes('SMTP_PASSWORD');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  const isLocked = (field: string) => envOverrides.includes(ENV_MAP[field]);

  const handleSave = async () => {
    const port = parseInt(form.port, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      addToast('Port must be a number between 1 and 65535.', 'error');
      return;
    }
    try {
      await updateSetting({
        host: form.host,
        port,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        username: form.username,
        enableSsl: form.enableSsl,
      }).unwrap();
      setDirty(false);
      addToast('SMTP settings saved.', 'success');
    } catch {
      addToast('Failed to save SMTP settings.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">SMTP Settings</h1>
        <p className="text-sm text-gray-500">
          Configure outgoing email for notifications and system messages.
        </p>
      </div>

      {hasEnvOverrides && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-semibold mb-1">Some fields are locked by environment variables</p>
            <p>
              The following ENV vars are active and take priority over DB values:{' '}
              <code className="font-mono">{envOverrides.join(', ')}</code>.
              Fields stored in the database will be ignored for those keys while ENV vars are set.
            </p>
          </div>
        </div>
      )}

      {/* Server Configuration */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Server className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Server Configuration</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="SMTP Host" field="host" envOverrides={envOverrides}>
                <input
                  type="text"
                  value={form.host}
                  disabled={isLocked('host')}
                  onChange={(e) => set('host', e.target.value)}
                  placeholder="smtp.example.com"
                  className={inputCls(isLocked('host'))}
                />
              </Field>
            </div>
            <Field label="Port" field="port" envOverrides={envOverrides}>
              <input
                type="number"
                value={form.port}
                disabled={isLocked('port')}
                onChange={(e) => set('port', e.target.value)}
                placeholder="587"
                min={1}
                max={65535}
                className={inputCls(isLocked('port'))}
              />
            </Field>
          </div>

          <Field label="Enable SSL/TLS" field="enableSsl" envOverrides={envOverrides}>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-gray-900">
                  {form.enableSsl ? 'SSL/TLS Enabled' : 'SSL/TLS Disabled'}
                </p>
                <p className="text-xs text-gray-500">
                  {form.enableSsl
                    ? 'Connection is encrypted. Recommended for port 465 or 587.'
                    : 'Connection is unencrypted. Use only in trusted internal networks.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.enableSsl}
                disabled={isLocked('enableSsl')}
                onClick={() => !isLocked('enableSsl') && set('enableSsl', !form.enableSsl)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2',
                  isLocked('enableSsl') ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.enableSsl ? 'bg-[var(--primary)]' : 'bg-gray-200',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition duration-200',
                    form.enableSsl ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          </Field>
        </div>
      </div>

      {/* Sender Information */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Mail className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Sender Information</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <Field label="Sender Name" field="senderName" envOverrides={envOverrides}>
            <input
              type="text"
              value={form.senderName}
              disabled={isLocked('senderName')}
              onChange={(e) => set('senderName', e.target.value)}
              placeholder="JobPortal Careers"
              className={inputCls(isLocked('senderName'))}
            />
          </Field>
          <Field label="Sender Email" field="senderEmail" envOverrides={envOverrides}>
            <input
              type="email"
              value={form.senderEmail}
              disabled={isLocked('senderEmail')}
              onChange={(e) => set('senderEmail', e.target.value)}
              placeholder="no-reply@example.com"
              className={inputCls(isLocked('senderEmail'))}
            />
          </Field>
          <Field label="Username" field="username" envOverrides={envOverrides}>
            <input
              type="text"
              value={form.username}
              disabled={isLocked('username')}
              onChange={(e) => set('username', e.target.value)}
              placeholder="Same as sender email in most cases"
              className={inputCls(isLocked('username'))}
            />
          </Field>
        </div>
      </div>

      {/* Password — ENV only */}
      <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <Lock className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Password</h2>
        </div>
        <div className="px-6 py-5">
          <div className={cn(
            'flex items-start gap-3 rounded-lg border px-4 py-3',
            passwordFromEnv ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50',
          )}>
            <Lock className={cn('h-4 w-4 shrink-0 mt-0.5', passwordFromEnv ? 'text-green-600' : 'text-gray-400')} />
            <div className="flex flex-col gap-0.5">
              <p className={cn('text-sm font-medium', passwordFromEnv ? 'text-green-800' : 'text-gray-700')}>
                {passwordFromEnv ? 'Password configured via SMTP_PASSWORD' : 'Password not configured'}
              </p>
              <p className="text-xs text-gray-500">
                The SMTP password is a secret and cannot be stored via this UI. Set the{' '}
                <code className="font-mono">SMTP_PASSWORD</code> environment variable on the server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white min-w-28"
        >
          Save
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
