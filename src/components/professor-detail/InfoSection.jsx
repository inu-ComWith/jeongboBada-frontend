import icon from "./IconCircle.module.css";
import styles from "./InfoSection.module.css";

// 상세 페이지 오른쪽의 아이콘 + 제목 + 내용 묶음
// actionLabel을 주면 아이콘과 제목이 버튼이 됨 (onAction이 없으면 비활성화)
// text: 제목 아래 설명 문단, children: 그 밖의 내용 (예: 담당과목 표)
export default function InfoSection({
  icon: iconNode,
  dark,
  actionLabel,
  onAction,
  title,
  extra,
  text,
  children,
}) {
  const iconClass = dark ? `${icon.iconCircle} ${styles.iconDark}` : icon.iconCircle;
  const buttonProps = {
    type: "button",
    onClick: onAction,
    disabled: !onAction,
  };

  return (
    <section className={styles.section}>
      {actionLabel ? (
        <button
          {...buttonProps}
          className={`${iconClass} ${styles.iconButton}`}
          aria-label={actionLabel}
        >
          {iconNode}
        </button>
      ) : (
        <span className={iconClass}>{iconNode}</span>
      )}
      <div className={styles.head}>
        <h2 className={styles.title}>
          {actionLabel ? (
            <button {...buttonProps} className={styles.titleButton} title={actionLabel}>
              {title}
            </button>
          ) : (
            title
          )}
        </h2>
        {extra}
      </div>
      {text && <p className={styles.text}>{text}</p>}
      {children}
    </section>
  );
}
