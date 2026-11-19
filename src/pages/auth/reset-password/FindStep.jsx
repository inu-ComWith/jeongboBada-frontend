import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetCode } from "../../../api/auth";
import { getError } from "./constants";
import SupportButton from "./SupportButton";
import styles from "../ResetPw.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const studentIdPattern = /^\d{9}$/;

// 1단계: 이메일 + 학번 입력 후 인증번호 받기
export default function FindStep({
  email,
  setEmail,
  studentId,
  setStudentId,
  notice,
  setNotice,
  loading,
  setLoading,
  onCodeSent,
}) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const applyFieldErrors = (fields) => {
    const next = {};
    fields.forEach(({ field, message }) => {
      if (field) next[field] = message;
    });
    setErrors(next);
  };

  const handleSendCode = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "이메일을 입력해주세요";
    } else if (!emailPattern.test(email.trim()) || email.trim().length > 100) {
      nextErrors.email = "이메일 형식이 올바르지 않아요 (예: name@inu.ac.kr)";
    }

    if (!studentId.trim()) {
      nextErrors.studentId = "학번을 입력해주세요";
    } else if (!studentIdPattern.test(studentId.trim())) {
      nextErrors.studentId = "학번은 숫자 9자리로 입력해주세요";
    }

    setErrors(nextErrors);
    setNotice("");

    if (Object.keys(nextErrors).length > 0 || loading) return;

    setLoading(true);

    try {
      const result = await sendPasswordResetCode({
        studentId: studentId.trim(),
        email: email.trim(),
      });

      onCodeSent(result);
    } catch (error) {
      const { code: errorCode, fields } = getError(error);

      switch (errorCode) {
        case "INVALID_INPUT_VALUE":
          applyFieldErrors(fields);
          if (!fields.length) {
            setNotice("입력한 이메일과 학번이 올바른지 확인해주세요");
          }
          break;

        case "PASSWORD_RESET_ACCOUNT_NOT_FOUND":
          setNotice("입력한 이메일과 학번으로 가입된 계정을 찾을 수 없어요");
          setErrors({
            email: " ",
            studentId: " ",
          });
          break;

        case "VERIFICATION_CODE_RESEND_TOO_FAST":
          setNotice("잠시 후 다시 시도해주세요");
          break;

        case "PASSWORD_RESET_RESEND_LIMIT_EXCEEDED":
          setNotice("오늘 발송 횟수를 모두 사용했어요 내일 다시 시도해주세요");
          break;

        case "EMAIL_SEND_FAILED":
          setNotice("메일 발송에 실패했어요 잠시 후 다시 시도해주세요");
          break;

        default:
          setNotice("요청을 처리하지 못했어요 잠시 후 다시 시도해주세요");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.findSection}>
      <h1 className={styles.pageTitle}>비밀번호 찾기</h1>
      <p className={styles.description}>
        가입할 때 입력한 이메일과 학번을 입력하면
        <br />
        이메일로 6자리 인증번호를 보내드려요
      </p>

      {notice && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠</span>
          {notice}
        </div>
      )}

      <form className={styles.formCard} onSubmit={handleSendCode} noValidate>
        <div className={styles.fieldRow}>
          <label htmlFor="resetEmail">이메일</label>
          <div className={styles.fieldContent}>
            <input
              id="resetEmail"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              value={email}
              placeholder="가입한 이메일을 입력해주세요"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
                setNotice("");
              }}
            />
            {errors.email?.trim() && (
              <p className={styles.fieldError}>{errors.email}</p>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <label htmlFor="resetStudentId">학번</label>
          <div className={styles.fieldContent}>
            <input
              id="resetStudentId"
              className={`${styles.input} ${errors.studentId ? styles.inputError : ""}`}
              value={studentId}
              inputMode="numeric"
              maxLength={9}
              placeholder="학번을 입력해주세요"
              onChange={(e) => {
                setStudentId(e.target.value.replace(/\D/g, ""));
                setErrors((prev) => ({ ...prev, studentId: "" }));
                setNotice("");
              }}
            />
            {errors.studentId?.trim() && (
              <p className={styles.fieldError}>{errors.studentId}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "인증번호 보내는 중..." : "인증번호 받기"}
        </button>

        {notice && (
          <div className={styles.helpBox}>
            <p>
              이메일이 기억나지 않거나 더 이상 쓰지 않는 이메일인가요?
              <br />
              운영진에게 문의하면 본인 확인 후 도와드려요
            </p>
            <SupportButton />
          </div>
        )}
      </form>

      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigate("/login")}
      >
        로그인으로 돌아가기
      </button>
    </section>
  );
}
