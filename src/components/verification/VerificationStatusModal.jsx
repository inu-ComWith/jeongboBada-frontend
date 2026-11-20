import { Clock3, AlertTriangle, X, MessageCircle } from "lucide-react";
import styles from "./VerificationStatusModal.module.css";

export default function VerificationStatusModal({
  type,
  requestedAt,
  rejectionReason,
  onClose,
  onResubmit,
}) {
  const isPending = type === "pending";

  const formattedDate = requestedAt
    ? String(requestedAt).slice(0, 10).replaceAll("-", ".")
    : "확인 중";

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        <div className={styles.iconCircle}>
          {isPending ? <Clock3 size={27} /> : <AlertTriangle size={27} />}
        </div>

        <h2 id="verification-modal-title">
          {isPending ? "가입 승인을 기다리고 있어요" : "가입이 반려되었어요"}
        </h2>

        {isPending ? (
          <>
            <p className={styles.description}>
              제출한 신분 확인 서류를 운영진이 확인하고 있어요
              <br />
              승인은 보통 1~2일 걸리며, 완료되면 가입한 이메일로 알려드려요
            </p>

            <div className={styles.dateBox}>
              <span>신청일</span>
              <strong>{formattedDate}</strong>
            </div>
          </>
        ) : (
          <>
            <p className={styles.description}>
              제출한 서류로 신분 확인이 어려우니, 서류를 다시 업로드해 주세요
            </p>

            <div className={styles.reasonBox}>
              <strong>반려 사유</strong>
              <p>{rejectionReason || "반려 사유를 확인할 수 없습니다."}</p>
            </div>
          </>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.contactButton}
            onClick={() => {
              // TODO: 실제 카카오톡 오픈채팅 URL 연결
              window.alert("문의 링크를 준비 중입니다.");
            }}
          >
            <MessageCircle size={18} />
            카카오톡 오픈채팅 문의
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={isPending ? onClose : onResubmit}
          >
            {isPending ? "확인" : "서류 다시 올리기"}
          </button>
        </div>
      </div>
    </div>
  );
}
