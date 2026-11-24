import { invoke, isTauri } from '@tauri-apps/api/core';

/**
 * Harici bir URL'yi (ör. WhatsApp wa.me bağlantısı) masaüstü uygulamasında
 * varsayılan sistem tarayıcısında, web ortamında yeni sekmede açar.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isTauri()) {
    await invoke('open_external_url', { url });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * JSON yedek dosyasını masaüstü uygulamasında yerel "Farklı Kaydet" penceresiyle,
 * web ortamında ise tarayıcı indirmesiyle kaydeder.
 */
export async function saveBackupFile(
  defaultName: string,
  content: string
): Promise<{ saved: boolean; path?: string }> {
  if (isTauri()) {
    const savedPath = await invoke<string | null>('save_backup_file', {
      defaultName,
      content,
    });
    if (!savedPath) {
      return { saved: false };
    }
    return { saved: true, path: savedPath };
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { saved: true };
}
