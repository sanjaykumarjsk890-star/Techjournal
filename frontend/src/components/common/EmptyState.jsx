import { FileQuestion } from "lucide-react";

function EmptyState({
  title = "No articles found",
  message = "Try adjusting your search or filters to find what you're looking for.",
  actionText,
  onAction,
  icon: Icon = FileQuestion,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="empty-state-btn">
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
