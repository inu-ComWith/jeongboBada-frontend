import { useState } from "react";
import styles from "./ResetPw.module.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import FindStep from "./reset-password/FindStep";
import VerifyStep from "./reset-password/VerifyStep";
import PasswordStep from "./reset-password/PasswordStep";
import {
  CODE_SECONDS,
  RESEND_SECONDS,
  getError,
} from "./reset-password/constants";

export default function ResetPw() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // 인증번호 관련 상태 (3단계에서 코드 오류 시 2단계로 되돌아가도 유지되도록 여기서 관리)
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [attempts, setAttempts] = useState(null); //인증 번호 잘못 입력한 횟수
  const [codeBlocked, setCodeBlocked] = useState(false);
  const [expired, setExpired] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [maxResendCount, setMaxResendCount] = useState(5);
  const [resendLimited, setResendLimited] = useState(false);
  const [mailGuide, setMailGuide] = useState(false);

  const [codeDeadline, setCodeDeadline] = useState(null); //인증번호 만료 시각
  const [resendDeadline, setResendDeadline] = useState(null); //인증번호 재발송 텀 (1분)
  const [now, setNow] = useState(Date.now());

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 이전 인증번호 상태 초기화
  const resetCodeState = () => {
    setCode("");
    setCodeError("");
    setAttempts(null);
    setCodeBlocked(false);
    setExpired(false);
    setMailGuide(false);
  };

  const startCodeTimer = () => {
    const current = Date.now();
    setNow(current);
    setCodeDeadline(current + CODE_SECONDS * 1000); //현재로부터 5분 뒤
    setResendDeadline(current + RESEND_SECONDS * 1000); //60초 뒤
  };

  const handleCodeSent = (result) => {
    setResendCount(result.data?.resendCount ?? 0);
    setMaxResendCount(result.data?.maxResendCount ?? 5);
    setResendLimited(false);
    resetCodeState();
    startCodeTimer();
    setStep(2);
  };

  const handleCodeError = (error) => {
    const { code: errorCode, message } = getError(error);

    switch (errorCode) {
      case "PASSWORD_RESET_CODE_MISMATCH": {
        const match = message?.match(/\((\d+)\/5회\)/);
        const count = match ? Number(match[1]) : null;
        setAttempts(count);
        setCodeError(message || "인증번호가 일치하지 않아요");
        break;
      }

      case "PASSWORD_RESET_CODE_ATTEMPTS_EXCEEDED":
        setCodeBlocked(true);
        setStep(1);
        setNotice(
          "인증번호를 5회 잘못 입력했어요 인증번호를 다시 받거나 운영진에게 문의해주세요",
        );
        break;

      case "PASSWORD_RESET_CODE_EXPIRED":
        setExpired(true);
        setCodeError("입력 시간이 초과되었으니 인증번호를 다시 받아주세요");
        break;

      case "INVALID_VERIFICATION_CODE":
        setStep(1);
        setNotice("유효한 인증번호가 없어요 인증번호를 다시 받아주세요");
        break;

      default:
        setCodeError("인증번호 확인에 실패했어요 다시 시도해주세요");
    }
  };

  return (
    <div className={styles.layout}>
      <Header />

      <main className={styles.page}>
        {step === 1 && (
          <FindStep
            email={email}
            setEmail={setEmail}
            studentId={studentId}
            setStudentId={setStudentId}
            notice={notice}
            setNotice={setNotice}
            loading={loading}
            setLoading={setLoading}
            onCodeSent={handleCodeSent}
          />
        )}
      </main>

      <Footer />

      {step === 2 && (
        <VerifyStep
          email={email}
          studentId={studentId}
          notice={notice}
          setNotice={setNotice}
          loading={loading}
          setLoading={setLoading}
          setStep={setStep}
          code={code}
          setCode={setCode}
          codeError={codeError}
          setCodeError={setCodeError}
          attempts={attempts}
          codeBlocked={codeBlocked}
          expired={expired}
          setExpired={setExpired}
          resendCount={resendCount}
          setResendCount={setResendCount}
          maxResendCount={maxResendCount}
          setMaxResendCount={setMaxResendCount}
          resendLimited={resendLimited}
          setResendLimited={setResendLimited}
          mailGuide={mailGuide}
          setMailGuide={setMailGuide}
          codeDeadline={codeDeadline}
          resendDeadline={resendDeadline}
          setResendDeadline={setResendDeadline}
          now={now}
          setNow={setNow}
          resetCodeState={resetCodeState}
          startCodeTimer={startCodeTimer}
          handleCodeError={handleCodeError}
        />
      )}

      {step === 3 && (
        <PasswordStep
          studentId={studentId}
          code={code}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          loading={loading}
          setLoading={setLoading}
          setStep={setStep}
          handleCodeError={handleCodeError}
        />
      )}
    </div>
  );
}
