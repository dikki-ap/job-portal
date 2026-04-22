export async function downloadWithAuth(url: string, token: string | undefined, fallbackFilename = 'download') {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const disposition = res.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename\*?=(?:UTF-8''|["']?)([^"';\r\n]+)/i);
  const filename = match ? decodeURIComponent(match[1]) : fallbackFilename;

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}
