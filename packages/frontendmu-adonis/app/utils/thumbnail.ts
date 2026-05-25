export function thumbnailFor(url: string, width: number): string {
  // weserv can only fetch publicly-reachable URLs. Skip it for relative paths
  // (dev fs disk serves `/uploads/...`) and any non-https origin.
  if (!url.startsWith('https://')) return url
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp`
}
