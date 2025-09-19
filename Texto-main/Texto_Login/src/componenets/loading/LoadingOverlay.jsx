// LoadingOverlay.jsx
import React from "react";

const LoadingOverlay = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinner}></div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(255, 255, 255, 0.7)", // light transparent background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  spinner: {
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #7b3af5", // purple color
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    animation: "spin 1s linear infinite",
  },
};

// Add animation globally
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default LoadingOverlay;
