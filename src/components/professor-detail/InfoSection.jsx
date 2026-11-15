import "./InfoSection.css";

// 상세 페이지 오른쪽의 아이콘 + 제목 + 내용 묶음
// actionLabel을 주면 아이콘과 제목이 버튼이 됨 (onAction이 없으면 비활성화)
export default function InfoSection({ icon, dark, actionLabel, onAction, title, extra, children }) {
  const iconClass = `icon-circle${dark ? " icon-circle--dark" : ""}`;
  const buttonProps = {
    type: "button",
    onClick: onAction,
    disabled: !onAction,
  };

  return (
    <section className="info-section">
      {actionLabel ? (
        <button {...buttonProps} className={`${iconClass} icon-circle--button`} aria-label={actionLabel}>
          {icon}
        </button>
      ) : (
        <span className={iconClass}>{icon}</span>
      )}
      <div className="info-section__head">
        <h2 className="info-section__title">
          {actionLabel ? (
            <button {...buttonProps} className="info-section__title-btn" title={actionLabel}>
              {title}
            </button>
          ) : (
            title
          )}
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );
}
