import { Component } from "react";
import toast from "react-hot-toast";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    toast.error("Something went wrong. Please refresh the page.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Oops! Something went wrong</h1>
            <p style={styles.message}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              style={styles.button}
            >
              Go to Home
            </button>
            {import.meta.env.DEV && (
              <details style={styles.details}>
                <summary>Error Details (Dev Only)</summary>
                <pre style={styles.code}>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "20px",
  },
  card: {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "40px",
    maxWidth: "500px",
    textAlign: "center",
  },
  icon: { fontSize: "48px", marginBottom: "20px" },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "var(--text)",
  },
  message: { color: "var(--text2)", marginBottom: "20px", lineHeight: "1.5" },
  button: {
    padding: "10px 20px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  details: { marginTop: "30px", textAlign: "left" },
  code: {
    background: "var(--bg)",
    padding: "10px",
    borderRadius: "var(--radius)",
    overflow: "auto",
    fontSize: "12px",
    maxHeight: "200px",
    color: "var(--text2)",
  },
};

export default ErrorBoundary;
