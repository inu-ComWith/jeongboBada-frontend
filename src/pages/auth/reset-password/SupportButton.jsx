import { MessageCircle } from "lucide-react";
import { SUPPORT_URL } from "./constants";
import styles from "../ResetPw.module.css";

export default function SupportButton({
  children = "카카오톡 오픈채팅으로 문의하기",
}) {
  return (
    <button
      type="button"
      className={styles.supportButton}
      onClick={() => {
        if (SUPPORT_URL) {
          window.open(SUPPORT_URL, "_blank", "noopener,noreferrer");
        }
      }}
    >
      <MessageCircle size={17} />
      {children}
    </button>
  );
}
