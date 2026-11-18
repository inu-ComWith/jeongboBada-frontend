import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, Mail, X } from "lucide-react";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from "../../../api/auth";
import { MAX_ATTEMPTS, RESEND_SECONDS, getError } from "./constants";
import SupportButton from "./SupportButton";
import styles from "../ResetPw.module.css";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

// 2단계: 이메일로 받은 6자리 인증번호 입력
export default function VerifyStep({
  email,
  studentId,
  notice,
  setNotice,
  loading,
  setLoading,
  setStep,
  code,
  setCode,
  codeError,
  setCodeError,
  attempts,
  codeBlocked,
  expired,
  setExpired,
  resendCount,
  setResendCount,
  maxResendCount,
  setMaxResendCount,
  resendLimited,
  setResendLimited,
  mailGuide,
  setMailGuide,
  codeDeadline,
  resendDeadline,
  setResendDeadline,
  now,
  setNow,
  resetCodeState,
  startCodeTimer,
  handleCodeError,
}) {
  const navigate = useNavigate();
  const codeInputRef = useRef(null);

  const remainingSeconds = codeDeadline
    ? Math.max(0, Math.ceil((codeDeadline - now) / 1000))
    : 0;

  const resendRemaining = resendDeadline
    ? Math.max(0, Math.ceil((resendDeadline - now) / 1000))
    : 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [setNow]);

  useEffect(() => {
    if (codeDeadline && remainingSeconds === 0 && !expired) {
      setExpired(true);
      setCodeError("입력 시간이 초과되었으니 인증번호를 다시 받아주세요");
    }
  }, [codeDeadline, remainingSeconds, expired, setExpired, setCodeError]);

  const handleResend = async () => {
    if (loading || resendRemaining > 0 || resendLimited) return;

    setLoading(true);
    setCodeError("");

    try {
      const result = await sendPasswordResetCode({
        studentId: studentId.trim(),
        email: email.trim(),
      });

      const count = result.data?.resendCount ?? resendCount + 1;

      setResendCount(count);
      setMaxResendCount(result.data?.maxResendCount ?? maxResendCount);
      resetCodeState();
      startCodeTimer();
      setMailGuide(true);
      setNotice(
        `인증번호를 다시 보냈어요 (${count}/${result.data?.maxResendCount ?? maxResendCount}회)`,
      );
    } catch (error) {
      const { code: errorCode, headers } = getError(error);

      if (errorCode === "VERIFICATION_CODE_RESEND_TOO_FAST") {
        const retryAfter = Number(headers?.["retry-after"]);
        const seconds =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter
            : RESEND_SECONDS;

        setResendDeadline(Date.now() + seconds * 1000);
        setCodeError(`${seconds}초 후 다시 요청해주세요`);
      } else if (errorCode === "PASSWORD_RESET_RESEND_LIMIT_EXCEEDED") {
        setResendLimited(true);
        setCodeError(
          "오늘 재발송 횟수를 모두 사용했어요 내일 다시 시도해주세요",
        );
      } else if (errorCode === "PASSWORD_RESET_ACCOUNT_NOT_FOUND") {
        setStep(1);
        setNotice("학번 또는 이메일을 확인해주세요");
      } else {
        setCodeError("메일 발송에 실패했어요 잠시 후 다시 시도해주세요");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (loading || codeBlocked || expired || remainingSeconds === 0) return;

    if (!/^\d{6}$/.test(code)) {
      setCodeError("인증번호 6자리를 입력해주세요");
      return;
    }

    setLoading(true);
    setCodeError("");

    try {
      await verifyPasswordResetCode({
        studentId: studentId.trim(),
        code,
      });

      // 재설정 API에서도 같은 코드를 사용하므로 유지
      setStep(3);
      setNotice("");
    } catch (error) {
      handleCodeError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (event) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(next);

    if (!codeBlocked && !expired) {
      setCodeError("");
    }
  };

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verifyTitle"
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
          <Mail size={24} />
        </div>

        <h2 id="verifyTitle" className={styles.modalTitle}>
          인증번호를 입력해주세요
        </h2>

        <p className={styles.modalDescription}>
          <strong>{email}</strong> 로 보낸
          <br />
          6자리 인증번호를 입력해주세요
        </p>

        <form onSubmit={handleVerify}>
          <div
            className={styles.codeContainer}
            onClick={() => codeInputRef.current?.focus()}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={`${styles.codeBox} ${
                  codeError ? styles.codeBoxError : ""
                } ${
                  !codeError && index === code.length
                    ? styles.codeBoxActive
                    : ""
                }`}
              >
                {code[index] || ""}
              </div>
            ))}

            <input
              ref={codeInputRef}
              className={styles.codeHiddenInput}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="6자리 인증번호"
              value={code}
              onChange={handleCodeChange}
              disabled={expired || codeBlocked || loading}
              maxLength={6}
            />
          </div>

          <div className={styles.codeMeta}>
            <span
              className={`${styles.timer} ${expired ? styles.dangerText : ""}`}
            >
              <Clock3 size={15} />
              {formatTime(remainingSeconds)}
            </span>

            <button
              type="button"
              className={styles.resendLink}
              onClick={handleResend}
              disabled={loading || resendRemaining > 0 || resendLimited}
            >
              {resendLimited
                ? "재발송 횟수 초과"
                : resendRemaining > 0
                  ? `재발송 ${resendRemaining}초 후 가능`
                  : "인증번호 다시 받기"}
            </button>
          </div>

          {codeError && (
            <p className={styles.codeError} role="alert">
              {codeError}
              {attempts !== null &&
                !codeError.includes("/5회") &&
                ` (${attempts}/${MAX_ATTEMPTS}회)`}
            </p>
          )}

          {codeBlocked && (
            <div className={styles.buttonRow}>
              <SupportButton>카카오톡 오픈채팅 문의</SupportButton>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleResend}
                disabled={loading || resendRemaining > 0 || resendLimited}
              >
                인증번호 다시 받기
              </button>
            </div>
          )}

          {!codeBlocked && !expired && (
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading || code.length !== 6 || remainingSeconds === 0}
            >
              {loading ? "확인 중..." : "확인"}
            </button>
          )}

          {expired && !codeBlocked && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleResend}
              disabled={loading || resendRemaining > 0 || resendLimited}
            >
              인증번호 다시 받기
            </button>
          )}

          {mailGuide && (
            <div className={styles.helpBox}>
              <strong>메일이 오지 않나요?</strong>
              <p>
                스팸함, 프로모션함을 확인해주세요
                <br />
                재발송은 하루 5회까지 가능해요
                <br />위 방법으로 해결되지 않으면 카카오톡 오픈채팅으로
                문의해주세요
              </p>
            </div>
          )}
        </form>
      </section>

      {notice && <div className={styles.toast}>{notice}</div>}
    </div>
  );
}
