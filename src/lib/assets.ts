export function isRemoteLink(url?: string | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    // Consider http(s) external links as remote if not our Cloudinary or our domain
    const host = u.host.toLowerCase();
    // Cloudinary hosts contain 'res.cloudinary.com'
    if (host.includes('res.cloudinary.com')) return false;
    // Local/relative URLs are not remote links
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    // Not a valid absolute URL -> likely relative/local
    return false;
  }
}

export function resolveAssetUrl(input?: string | null): string | undefined {
  if (!input) return undefined;
  // For now, the value is already a usable URL (Cloudinary public URL or remote link)
  // Later we can map asset IDs to URLs if we add that storage model.
  return input;
}

export function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.split('?')[0].toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.bmp') ||
    lower.endsWith('.svg') ||
    lower.includes('image/upload') // Cloudinary
  );
}
