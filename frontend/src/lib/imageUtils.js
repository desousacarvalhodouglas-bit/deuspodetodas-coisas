// Compress an image File to a base64 data URL.
// Resizes to maxWidth (preserving aspect ratio) and exports as JPEG at given quality.
export const compressImage = (file, maxWidth = 1024, quality = 0.7) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.type.startsWith('image/')) {
      // Not an image: fallback to plain data URL
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // Always export as JPEG to avoid huge PNGs
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Returns true if a URL is a stale browser-only blob URL that won't work
// across sessions. These come from older posts that incorrectly stored
// URL.createObjectURL() values.
export const isInvalidImageUrl = (url) =>
  typeof url === 'string' && url.startsWith('blob:');
