function Loader({ message = "Loading content..." }) {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader-spinner"></div>
      {message && <p className="loader-text">{message}</p>}
    </div>
  );
}

export default Loader;
