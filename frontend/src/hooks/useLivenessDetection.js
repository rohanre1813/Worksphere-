import { useRef, useState, useCallback, useEffect } from "react";
import * as faceapi from "face-api.js";

/*
====================================================
   EYE ASPECT RATIO (EAR) FORMULA
   Detects blinks by measuring the vertical distance
   between eyelid landmarks vs horizontal distance.
   
   EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
   
   When eyes are open: EAR ≈ 0.3 - 0.4
   When eyes are closed: EAR < 0.25
====================================================
*/

// Euclidean distance between two face landmark points
function distance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
  );
}

// Calculate EAR for one eye (6 landmark points)
function getEAR(eyePoints) {
  const vertical1 = distance(eyePoints[1], eyePoints[5]);
  const vertical2 = distance(eyePoints[2], eyePoints[4]);
  const horizontal = distance(eyePoints[0], eyePoints[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

const EAR_THRESHOLD = 0.25;       // Below this = eyes closed
const CONSEC_FRAMES_REQUIRED = 2; // Must be below threshold for 2 frames
const DETECTION_INTERVAL_MS = 100; // 10 FPS

export default function useLivenessDetection() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const closedFrameCount = useRef(0);
  const blinkDetected = useRef(false);

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // idle | checking_webgl | loading_models | no_face | waiting_blink | passed | unsupported | error

  const [modelsLoaded, setModelsLoaded] = useState(false);

  /*
  ====================================================
     CHECK WEBGL SUPPORT
  ====================================================
  */
  const checkWebGL = useCallback(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") || canvas.getContext("webgl");
      return !!gl;
    } catch {
      return false;
    }
  }, []);

  /*
  ====================================================
     LOAD FACE-API MODELS (once)
  ====================================================
  */
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return true;

    setStatus("loading_models");

    try {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      return true;
    } catch (err) {
      console.error("Failed to load face-api models:", err);
      setErrorMsg(`Model error: ${err.message}`);
      setStatus("error");
      return false;
    }
  }, [modelsLoaded]);

  /*
  ====================================================
     PROCESS A SINGLE FRAME (called at 10 FPS)
  ====================================================
  */
  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || blinkDetected.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        setStatus("no_face");
        closedFrameCount.current = 0;
        return;
      }

      setStatus("waiting_blink");

      // Extract eye landmark points
      // Left eye: landmarks 36-41, Right eye: landmarks 42-47
      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();   // 6 points
      const rightEye = landmarks.getRightEye(); // 6 points

      const leftEAR = getEAR(leftEye);
      const rightEAR = getEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;

      if (avgEAR < EAR_THRESHOLD) {
        closedFrameCount.current += 1;
      } else {
        // Eyes opened again after being closed
        if (closedFrameCount.current >= CONSEC_FRAMES_REQUIRED) {
          blinkDetected.current = true;
          setStatus("passed");
        }
        closedFrameCount.current = 0;
      }
    } catch (err) {
      console.error("Frame processing error:", err);
    }
  }, []);

  /*
  ====================================================
     START DETECTION
  ====================================================
  */
  const startDetection = useCallback(async () => {
    // 1. Check WebGL
    setStatus("checking_webgl");
    if (!checkWebGL()) {
      setStatus("unsupported");
      return false;
    }

    // 2. Load models
    const loaded = await loadModels();
    if (!loaded) return false;

    // 3. Open front camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => {
            console.error("Play error:", e);
            setErrorMsg(`Play error: ${e.message}`);
            setStatus("error");
          });
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg(`Camera error: ${err.name} - ${err.message}`);
      setStatus("error");
      return false;
    }

    // 4. Reset state
    closedFrameCount.current = 0;
    blinkDetected.current = false;
    setStatus("no_face");

    // 5. Start 10 FPS detection loop
    intervalRef.current = setInterval(() => {
      processFrame();
    }, DETECTION_INTERVAL_MS);

    return true;
  }, [checkWebGL, loadModels, processFrame]);

  /*
  ====================================================
     STOP DETECTION & CLEANUP
  ====================================================
  */
  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    closedFrameCount.current = 0;
    blinkDetected.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    status,
    errorMsg,
    videoRef,
    startDetection,
    stopDetection,
  };
}
