import { GraduationCap, X } from "lucide-react";
import styles from "../../pages/auth/Signup.module.css";

export default function VerificationGuideModal({ onClose }) {
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
        aria-label="신분 확인 서류 안내"
      >
        <button
          type="button"
          className={styles.modalClose}
          aria-label="닫기"
          onClick={onClose}
        >
          <X size={19} />
        </button>

        <div className={styles.modalIcon}>
          <GraduationCap size={25} />
        </div>

        <h2>신분 확인 서류 중 하나를 첨부해주세요</h2>

        <ul>
          <li>재학 증명서</li>
          <li>학생증</li>
          <li>성적 증명서</li>
          <li>학비 납입 증명서</li>
          <li>졸업 예정 증명서</li>
        </ul>

        <p className={styles.modalNotes}>
          · pdf, jpg 파일 · 최대 10MB
          <br />
          · 이름과 학번이 잘 보이게 찍어주세요
          <br />
          · 주민등록번호 등 불필요한 개인정보는 가린 뒤 올려주세요
          <br />· 제출한 서류는 승인 후 바로 삭제돼요
        </p>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
