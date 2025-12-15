export const prefetchVisionAssets = async () => {
  const urls = [
    '/assets/wasm/vision_wasm_internal.js',
    '/assets/wasm/vision_wasm_internal.wasm',
    '/assets/wasm/vision_wasm_nosimd_internal.js',
    '/assets/wasm/vision_wasm_nosimd_internal.wasm',
    '/assets/modules/hand_landmarker.task'
  ];
  const cache = 'force-cache';
  await Promise.all(
    urls.map(u => fetch(u, { cache }).catch(() => null))
  );
};
