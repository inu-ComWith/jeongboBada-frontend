import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  Info,
  LockKeyhole,
  MessageCircle,
  X,
} from "lucide-react";

import { resubmitVerification } from "../../api/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VerificationGuideModal from "../../components/verification/VerificationGuideModal";
import styles from "./VerificationResubmit.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (size) => `${(size / (1024 * 1024)).toFixed(1)}MB`;

export default function VerificationResubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef(null);

  const studentId = location.state?.studentId ?? "";
  const nickname = location.state?.nickname ?? "";
  const rejectionReason = location.state?.rejectionReason ?? "";

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");

  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    if (!showGuide) return;

    const timer = setTimeout(() => {
      setShowGuide(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showGuide]);

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!/\.(pdf|jpe?g)$/i.test(selectedFile.name)) {
      setFile(null);
      setFileError("PDF 또는 JPG 파일만 첨부할 수 있어요.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setFileError("빈 파일은 첨부할 수 없어요.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError("10MB 이하 파일만 첨부할 수 있어요.");
      return;
    }

    setFile(selectedFile);
    setFileError("");
    setServerError("");
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !file || !studentId) return;

    setLoading(true);
    setServerError("");

    try {
      const result = await resubmitVerification({
        studentId,
        file,
      });

      const email = result?.data?.email;

      setSubmittedEmail(email ?? "");
      setComplete(true);
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code;
      const message = error.response?.data?.message;

      if (status === 401) {
        setServerError(message || "인증에 실패했습니다");
      } else if (status === 429) {
        setServerError(
          message || "요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
        );
      } else if (status === 409 && code === "VERIFICATION_NOT_REJECTED") {
        setServerError("현재 서류를 다시 제출할 수 없는 계정 상태입니다.");
      } else if (code === "FILE_EMPTY") {
        setFileError("빈 파일은 첨부할 수 없어요.");
      } else if (code === "FILE_TOO_LARGE") {
        setFileError("파일 크기는 10MB 이하여야 해요.");
      } else if (code === "FILE_TYPE_NOT_ALLOWED") {
        setFileError("PDF 또는 JPG 파일만 첨부할 수 있어요.");
      } else if (code === "FILE_UPLOAD_FAILED") {
        setServerError("파일 업로드에 실패했어요. 다시 시도해주세요.");
      } else {
        setServerError(
          message || "서류 제출에 실패했습니다. 다시 시도해주세요.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그인 반려 모달을 거치지 않고 직접 들어오거나 새로고침한 경우
  if (!studentId) {
    return <Navigate to="/login" replace />;
  }

  if (complete) {
    return (
      <div className={styles.page}>
        <Header />

        <main className={styles.completeMain}>
          <div className={styles.completeIcon}>
            <CheckCircle2 size={34} />
          </div>

          <h1>서류를 다시 제출했어요</h1>

          <p>
            운영진이 새 서류를 확인한 뒤 1~2일 안에 결과를 알려드려요
            <br />
            결과는 <strong>{submittedEmail}</strong>로 알려드릴게요
          </p>

          <button
            type="button"
            className={styles.submitButton}
            onClick={() => navigate("/", { replace: true })}
          >
            메인으로 가기
          </button>

          <div className={styles.completeNotice}>
            검토 중에는 로그인 시 승인 대기 화면이 보여요
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.heading}>
          <h1>서류 다시 올리기</h1>
          <span>반려 사유를 확인하고 서류를 다시 올려주세요</span>
        </div>

        <div className={styles.reasonBox}>
          <AlertTriangle size={18} />
          <div>
            <strong>반려 사유</strong>
            <p>{rejectionReason || "반려 사유를 확인할 수 없습니다."}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <label htmlFor="nickname">닉네임</label>
            <div className={styles.control}>
              <div className={styles.readonlyField}>
                <input
                  id="nickname"
                  value={nickname}
                  placeholder="닉네임"
                  readOnly
                />
                <LockKeyhole size={17} />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="studentId">학번</label>
            <div className={styles.control}>
              <div className={styles.readonlyField}>
                <input
                  id="studentId"
                  value={studentId}
                  placeholder="학번"
                  readOnly
                />
                <LockKeyhole size={17} />
              </div>
              <p className={styles.hint}>가입 정보는 수정할 수 없어요</p>
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="verificationFile">신분 확인 서류</label>

            <div className={styles.control}>
              <div className={styles.fileLine}>
                <div
                  className={`${styles.fileField} ${
                    file ? styles.fileSelected : ""
                  }`}
                >
                  {file ? (
                    <div className={styles.selectedFile}>
                      <FileText size={17} />
                      <span>
                        {file.name} · {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={removeFile}
                        aria-label="파일 삭제"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={styles.filePlaceholder}>
                        pdf, jpg 파일 (최대 10MB)
                      </span>
                      <button
                        type="button"
                        className={styles.chooseFile}
                        onClick={() => fileRef.current?.click()}
                      >
                        파일 선택
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className={styles.infoButton}
                  onMouseEnter={() => setShowGuide(true)}
                  onFocus={() => setShowGuide(true)}
                  aria-label="신분 확인 서류 안내"
                >
                  <Info size={21} />
                </button>
              </div>

              <input
                ref={fileRef}
                id="verificationFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                className={styles.hiddenInput}
                onChange={(e) => selectFile(e.target.files?.[0])}
              />

              {fileError ? (
                <p className={styles.errorText}>{fileError}</p>
              ) : file ? (
                <p className={styles.successText}>업로드 완료</p>
              ) : null}
            </div>
          </div>

          <div className={styles.checklist}>
            <strong>다시 올리기 전에 확인해주세요</strong>
            <p>
              <Check size={15} /> 이름과 학번이 선명하게 보이나요?
            </p>
            <p>
              <Check size={15} /> 빛 반사나 잘린 부분은 없나요?
            </p>
            <p>
              <Check size={15} /> 이번 학기 재학증명서 또는 학생증인가요?
            </p>
          </div>

          {serverError && (
            <p className={styles.errorText} role="alert">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!file || !studentId || loading}
          >
            {loading ? "제출 중..." : "다시 제출하기"}
          </button>

          <p className={styles.contactText}>
            도움이 필요하신가요?
            <button
              type="button"
              onClick={() => window.alert("문의 링크를 준비 중입니다.")}
            >
              <MessageCircle size={16} />
              카카오톡 오픈채팅 문의
            </button>
          </p>
        </form>
      </main>

      <Footer />

      {showGuide && (
        <VerificationGuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
