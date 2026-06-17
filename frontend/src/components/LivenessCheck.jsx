"use client";

import { useEffect } from "react";
import useLivenessDetection from "../hooks/useLivenessDetection";

/*
====================================================
   LIVENESS CHECK COMPONENT
   
   Shows the front camera with a face guide overlay.
   Uses the useLivenessDetection hook to detect
   blinks at 10 FPS with WebGL GPU acceleration.
   
   Props:
   - onSuccess()  → called when blink is verified
   - onCancel()   → called when user taps cancel
   - zoneName     → the zone name to display
====================================================
*/

export default function LivenessCheck({ onSuccess, onCancel, zoneName, employeeDescriptor }) {
  const { status, errorMsg, debugEAR, videoRef, startDetection, stopDetection } =
    useLivenessDetection(employeeDescriptor);

  /*
  ====================================================
     START ON MOUNT
  ====================================================
  */
  useEffect(() => {
    startDetection();

    return () => {
      stopDetection();
    };
  }, [startDetection, stopDetection]);

  /*
  ====================================================
     AUTO-TRIGGER SUCCESS AFTER BLINK
  ====================================================
  */
  useEffect(() => {
    if (status === "passed") {
      // Small delay to show the success animation
      const timer = setTimeout(() => {
        stopDetection();
        onSuccess();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [status, onSuccess, stopDetection]);

  /*
  ====================================================
     STATUS TEXT & COLORS
  ====================================================
  */
  const getStatusInfo = () => {
    switch (status) {
      case "checking_webgl":
      case "loading_models":
        return {
          text: "Loading face detection models...",
          color: "#f59e0b",
          icon: "⏳",
        };
      case "no_face":
        return {
          text: "Position your face in the oval",
          color: "#ef4444",
          icon: "👤",
        };
      case "waiting_blink":
        return {
          text: "Face detected! Please blink naturally",
          color: "#3b82f6",
          icon: "👁️",
        };
      case "passed":
        return {
          text: "✅ Liveness verified!",
          color: "#22c55e",
          icon: "✅",
        };
      case "unsupported":
        return {
          text: "Your device does not support face detection",
          color: "#ef4444",
          icon: "⚠️",
        };
      case "error":
        return {
          text: "Camera or model error. Please try again.",
          color: "#ef4444",
          icon: "❌",
        };
      default:
        return {
          text: "Initializing...",
          color: "#9ca3af",
          icon: "⏳",
        };
    }
  };

  const statusInfo = getStatusInfo();

  /*
  ====================================================
     ERROR / UNSUPPORTED DEVICE UI
  ====================================================
  */
  if (status === "unsupported" || status === "error") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>{status === "error" ? "❌" : "⚠️"}</div>
          <h2 style={styles.title}>{status === "error" ? "Something went wrong" : "Device Not Supported"}</h2>
          <p style={{...styles.subtitle, color: status === "error" ? "#ef4444" : "#555"}}>
            {status === "error" ? errorMsg : "Your device does not support hardware-accelerated face detection (WebGL). Please see the manager for manual check-in."}
          </p>
          <button onClick={onCancel} style={styles.cancelBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /*
  ====================================================
     MAIN LIVENESS UI
  ====================================================
  */
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <h2 style={styles.title}>Liveness Verification</h2>
        <p style={styles.subtitle}>
          Entering: <strong>{zoneName}</strong>
        </p>

        {/* Camera Feed with Oval Overlay */}
        <div style={styles.videoWrapper}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={styles.video}
          />

          {/* Oval face guide */}
          <div style={styles.ovalOverlay}>
            <div
              style={{
                ...styles.oval,
                borderColor:
                  status === "passed"
                    ? "#22c55e"
                    : status === "waiting_blink"
                    ? "#3b82f6"
                    : "#ffffff80",
                boxShadow:
                  status === "passed"
                    ? "0 0 30px rgba(34, 197, 94, 0.5)"
                    : status === "waiting_blink"
                    ? "0 0 20px rgba(59, 130, 246, 0.3)"
                    : "none",
              }}
            />
          </div>

          {/* Loading spinner overlay */}
          {(status === "checking_webgl" || status === "loading_models") && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner} />
              <p style={{ color: "#fff", marginTop: "12px", fontSize: "14px" }}>
                Loading AI models...
              </p>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div
          style={{
            ...styles.statusBar,
            backgroundColor: statusInfo.color + "20",
            borderColor: statusInfo.color + "40",
          }}
        >
          <span style={{ fontSize: "20px" }}>{statusInfo.icon}</span>
          <span style={{ color: statusInfo.color, fontWeight: 600 }}>
            {statusInfo.text}
          </span>
        </div>

        {/* Debug EAR */}
        <div style={{ fontSize: "12px", color: "#666", textAlign: "center", fontFamily: "monospace" }}>
          {debugEAR}
        </div>

        {/* Cancel Button */}
        {status !== "passed" && (
          <button
            onClick={() => {
              stopDetection();
              onCancel();
            }}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/*
====================================================
   INLINE STYLES
   (Using inline styles to match the existing project
    style pattern and avoid additional CSS files)
====================================================
*/
const styles = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 50,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#555",
    margin: 0,
    textAlign: "center",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "4/3",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)", // Mirror the selfie camera
  },
  ovalOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  oval: {
    width: "55%",
    height: "75%",
    borderRadius: "50%",
    border: "3px solid rgba(255, 255, 255, 0.5)",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  statusBar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid",
    fontSize: "14px",
    textAlign: "center",
  },
  cancelBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "transparent",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#555",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
