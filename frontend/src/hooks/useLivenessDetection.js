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

const EAR_THRESHOLD = 0.28;       // Below this = eyes closed
const CONSEC_FRAMES_REQUIRED = 1; // Must be below threshold for 1 frame
const DETECTION_INTERVAL_MS = 100; // 10 FPS

export default function useLivenessDetection(storedDescriptor) {
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
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
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

  const [debugEAR, setDebugEAR] = useState("EAR: --");
  const isDetecting = useRef(false);

  /*
  ====================================================
     PROCESS A SINGLE FRAME
  ====================================================
  */
  const processFrame = useCallback(async () => {
    if (!isDetecting.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || blinkDetected.current) {
      if (isDetecting.current) setTimeout(processFrame, DETECTION_INTERVAL_MS);
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("no_face");
        setDebugEAR("EAR: No face");
        closedFrameCount.current = 0;
      } else {
        setStatus("waiting_blink");

        const landmarks = detection.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const leftEAR = getEAR(leftEye);
        const rightEAR = getEAR(rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2.0;
        
        setDebugEAR(`EAR: ${avgEAR.toFixed(3)}`);

        if (avgEAR < EAR_THRESHOLD) {
          closedFrameCount.current += 1;
        } else {
          if (closedFrameCount.current >= CONSEC_FRAMES_REQUIRED) {
            // Liveness passed, now check identity if enrolled
            if (storedDescriptor && storedDescriptor.length === 128) {
              const distance = faceapi.euclideanDistance(
                detection.descriptor,
                new Float32Array(storedDescriptor)
              );
              setDebugEAR(`Dist: ${distance.toFixed(3)}`);
              
              if (distance > 0.55) {
                setErrorMsg(`Face does not match account. (Score: ${distance.toFixed(2)})`);
                setStatus("error");
                isDetecting.current = false;
                return;
              }
            }

            blinkDetected.current = true;
            setStatus("passed");
            isDetecting.current = false;
            return;
          }
          closedFrameCount.current = 0;
        }
      }
    } catch (err) {
      console.error("Frame processing error:", err);
      // Don't crash entirely on one frame error, but log it
      setDebugEAR(`Err: ${err.message}`);
    }

    // Schedule next frame
    if (isDetecting.current) {
      setTimeout(processFrame, DETECTION_INTERVAL_MS);
    }
  }, []);

  /*
  ====================================================
     START DETECTION
  ====================================================
  */
  const startDetection = useCallback(async () => {
    setStatus("checking_webgl");
    if (!checkWebGL()) {
      setStatus("unsupported");
      return false;
    }

    const loaded = await loadModels();
    if (!loaded) return false;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasFakeCamera = devices.some(d => 
        d.label.toLowerCase().includes("virtual") || 
        d.label.toLowerCase().includes("obs")
      );
      if (hasFakeCamera) {
        setErrorMsg("Virtual Cameras are not allowed for security reasons.");
        setStatus("error");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
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

    closedFrameCount.current = 0;
    blinkDetected.current = false;
    setStatus("no_face");
    
    // Start recursive detection loop
    isDetecting.current = true;
    processFrame();

    return true;
  }, [checkWebGL, loadModels, processFrame]);

  /*
  ====================================================
     STOP DETECTION & CLEANUP
  ====================================================
  */
  const stopDetection = useCallback(() => {
    isDetecting.current = false;

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
    debugEAR,
    videoRef,
    startDetection,
    stopDetection,
  };
}
