import "../css/toast.css";

function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" && "✓"}
        {type === "error" && "!"}
        {type === "info" && "i"}
      </span>

      <span className="toast-message">
        {message}
      </span>

      <button
        className="toast-close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;