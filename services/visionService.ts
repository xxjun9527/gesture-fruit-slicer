import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export type VisionQuality = 'lite' | 'standard';

export const initializeVision = async (quality: VisionQuality) => {
  if (handLandmarker) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "/assets/wasm"
  );

  try {
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: quality === 'lite' ? `/assets/modules/hand_landmarker_lite.task` : `/assets/modules/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: quality === 'standard' && !isMobile ? 2 : 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: quality === 'standard' ? 0.5 : 0.4,
    });
  } catch (e) {
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `/assets/modules/hand_landmarker.task`,
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numHands: quality === 'standard' && !isMobile ? 2 : 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  return handLandmarker;
};

export const getLandmarker = () => handLandmarker;
