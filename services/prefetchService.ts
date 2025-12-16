const BASE = import.meta.env.BASE_URL;
export const prefetchVisionAssets = async () => {
  const urls = [
    BASE + 'assets/wasm/vision_wasm_internal.js',
    BASE + 'assets/wasm/vision_wasm_internal.wasm',
    BASE + 'assets/wasm/vision_wasm_nosimd_internal.js',
    BASE + 'assets/wasm/vision_wasm_nosimd_internal.wasm',
    BASE + 'assets/modules/hand_landmarker.task'
  ];
  const cache = 'force-cache';
  await Promise.all(
    urls.map(u => fetch(u, { cache }).catch(() => null))
  );
};

export const prefetchVisionAssetsWithProgress = async (onProgress: (percent: number) => void) => {
  const urls = [
    BASE + 'assets/wasm/vision_wasm_internal.wasm',
    BASE + 'assets/wasm/vision_wasm_nosimd_internal.wasm',
    BASE + 'assets/modules/hand_landmarker.task'
  ];
  let totalBytes = 0;
  const sizes = await Promise.all(
    urls.map(async u => {
      try {
        const head = await fetch(u, { method: 'HEAD' });
        const len = head.headers.get('content-length');
        return len ? parseInt(len, 10) : 0;
      } catch {
        return 0;
      }
    })
  );
  totalBytes = sizes.reduce((a, b) => a + b, 0);
  let loadedBytes = 0;
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    try {
      const res = await fetch(u, { cache: 'reload' });
      const reader = res.body?.getReader();
      if (!reader) {
        continue;
      }
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        loadedBytes += value.byteLength;
        const percent = totalBytes > 0 ? Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100))) : Math.max(0, Math.min(100, Math.round(((i + 0.5) / urls.length) * 100)));
        onProgress(percent);
      }
    } catch {
      const percent = Math.max(0, Math.min(100, Math.round(((i + 1) / urls.length) * 100)));
      onProgress(percent);
    }
  }
  onProgress(100);
};
