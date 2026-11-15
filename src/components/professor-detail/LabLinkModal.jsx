import { useEffect, useRef } from "react";
import "./LabLinkModal.css";

// 연구실 홈페이지로 이동할지 묻는 팝업
export default function LabLinkModal({ url, onClose }) {
  const cancelRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // 팝업을 연 버튼을 기억해 두었다가 닫힐 때 포커스를 되돌려줌
    const opener = document.activeElement;
    cancelRef.current?.focus();

    // ESC로 닫기 + Tab 이동이 팝업 밖으로 나가지 않게 막기
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;

      const buttons = modalRef.current.querySelectorAll("button:not([disabled])");
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // 팝업이 떠 있는 동안 뒤 화면 스크롤 막기
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      opener?.focus?.();
    };
  }, [onClose]);

  const handleMove = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal__close" aria-label="닫기" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 className="modal__title" id="lab-modal-title">
          연구실 홈페이지로 이동할까요?
        </h2>
        <p className="modal__desc">홈페이지로 이동해도 로그인 상태는 유지됩니다</p>

        <div className="modal__actions">
          <button type="button" className="modal__btn" ref={cancelRef} onClick={onClose}>
            취소
          </button>
          <button type="button" className="modal__btn modal__btn--primary" onClick={handleMove}>
            이동하기
          </button>
        </div>
      </div>
    </div>
  );
}
