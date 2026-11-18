import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { resetPassword } from "../../../api/auth";
import { getError } from "./constants";
import styles from "../ResetPw.module.css";

const getPasswordRules = (value) => ({
  length: value.length >= 8 && value.length <= 64,
  english: /[a-zA-Z]/.test(value),
  number: /\d/.test(value),
  bytes: new TextEncoder().encode(value).length <= 72,
});

function PasswordInput({ value, onChange, placeholder, error, id }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.inputWrap}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        autoComplete="new-password"
      />
      <button
        type="button"
        className={styles.eyeButton}
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

// 3단계: 새 비밀번호 설정
export default function PasswordStep({
  studentId,
  code,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  setLoading,
  setStep,
  handleCodeError,
}) {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const rules = getPasswordRules(newPassword);
  const passwordValid = Object.values(rules).every(Boolean);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleReset = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setConfirmError("");

    if (!passwordValid) {
      setPasswordError("영문과 숫자를 포함한 8~64자 비밀번호를 입력해주세요");
      return;
    }

    if (!passwordsMatch) {
      setConfirmError("비밀번호가 일치하지 않아요");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await resetPassword({
        studentId: studentId.trim(),
        code,
        newPassword,
      });

      // 비밀번호 변경 성공 시 기존 인증 정보 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      navigate("/login", {
        replace: true,
        state: {
          passwordResetSuccess: true,
          studentId: studentId.trim(),
        },
      });
    } catch (error) {
      const { code: errorCode, fields } = getError(error);

      if (errorCode === "PASSWORD_RESET_SAME_PASSWORD") {
        setPasswordError("이전과 같은 비밀번호는 쓸 수 없어요");
      } else if (errorCode === "INVALID_INPUT_VALUE") {
        const passwordField = fields.find(
          (item) => item.field === "newPassword",
        );
        setPasswordError(
          passwordField?.message || "비밀번호 규칙을 확인해주세요",
        );
      } else if (
        [
          "PASSWORD_RESET_CODE_MISMATCH",
          "PASSWORD_RESET_CODE_ATTEMPTS_EXCEEDED",
          "PASSWORD_RESET_CODE_EXPIRED",
          "INVALID_VERIFICATION_CODE",
        ].includes(errorCode)
      ) {
        handleCodeError(error);
        if (errorCode !== "INVALID_VERIFICATION_CODE") {
          setStep(
            errorCode === "PASSWORD_RESET_CODE_ATTEMPTS_EXCEEDED" ? 1 : 2,
          );
        }
      } else {
        setPasswordError("변경에 실패했어요. 잠시 후 다시 시도해주세요");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="passwordTitle"
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="닫기"
          onClick={() => navigate("/login")}
        >
          <X size={20} />
        </button>

        <div className={styles.circleIcon}>
          <LockKeyhole size={23} />
        </div>

        <h2 id="passwordTitle" className={styles.modalTitle}>
          비밀번호 재설정
        </h2>
        <p className={styles.resetDescription}>
          보안을 위해 새 비밀번호를 설정해주세요
        </p>

        <form className={styles.passwordForm} onSubmit={handleReset}>
          <div className={styles.fieldRow}>
            <label htmlFor="newPassword">새 비밀번호</label>
            <div className={styles.fieldContent}>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setPasswordError("");
                }}
                placeholder="ex. 영문·숫자 각 1자 이상 포함"
                error={passwordError}
              />

              {passwordError && (
                <p className={styles.fieldError}>{passwordError}</p>
              )}

              <div className={styles.ruleList}>
                <span className={rules.length ? styles.rulePass : ""}>
                  {rules.length ? "✓" : "○"} 8자 이상
                </span>
                <span className={rules.english ? styles.rulePass : ""}>
                  {rules.english ? "✓" : "○"} 영문 포함
                </span>
                <span className={rules.number ? styles.rulePass : ""}>
                  {rules.number ? "✓" : "○"} 숫자 포함
                </span>
              </div>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className={styles.fieldContent}>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setConfirmError("");
                }}
                placeholder="비밀번호를 한 번 더 입력해주세요"
                error={confirmError}
              />
              {(confirmError || (confirmPassword && !passwordsMatch)) && (
                <p className={styles.fieldError}>
                  {confirmError || "비밀번호가 일치하지 않아요"}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !passwordValid || !passwordsMatch}
          >
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </section>
    </div>
  );
}
