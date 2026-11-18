import { useEffect, useRef, useState } from "react";
import { useNavigate, useBeforeUnload, useBlocker } from "react-router-dom";
import {
  Check,
  X,
  Info,
  Eye,
  EyeOff,
  AlertTriangle,
  GraduationCap,
  FileText,
} from "lucide-react";

import { signup, checkNickname } from "../../api/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./Signup.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const nicknamePattern = /^[가-힣a-zA-Z0-9]{2,10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = (value) => ({
  length: value.length >= 8,
  english: /[a-zA-Z]/.test(value),
  number: /\d/.test(value),
});

const fileSize = (size) => `${(size / (1024 * 1024)).toFixed(1)}MB`;

export default function Signup() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    nickname: "",
    email: "",
    studentId: "",
    password: "",
    confirm: "",
  });

  const [nicknameStatus, setNicknameStatus] = useState(null);
  const [nicknameCheckedValue, setNicknameCheckedValue] = useState("");

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [showGuide, setShowGuide] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const fileRef = useRef(null);
  const guideTimer = useRef(null);
  const nicknameRequest = useRef(0);

  const hasChanges = Object.values(values).some(Boolean) || Boolean(file);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges &&
      !complete &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  const rules = passwordRules(values.password);
  const passwordValid = Object.values(rules).every(Boolean);

  const nicknameValid =
    nicknameStatus === "available" &&
    nicknameCheckedValue === values.nickname.trim();

  // 모달 타이머 정리
  useEffect(() => {
    return () => clearTimeout(guideTimer.current);
  }, []);

  useBeforeUnload(
    (event) => {
      if (hasChanges && !complete) {
        event.preventDefault();
        event.returnValue = "";
      }
    },
    { capture: true },
  );

  const change = (name, value) => {
    setValues((old) => ({
      ...old,
      [name]: value,
    }));

    if (name === "nickname") {
      nicknameRequest.current += 1; //이전 닉네임 api 요청 무효화
      setNicknameStatus(null);
      setNicknameCheckedValue("");
    }
  };

  const checkName = async () => {
    /************************ 테스트 ************************/
    // setNicknameStatus("available");
    // setNicknameCheckedValue(values.nickname.trim());
    // return;
    /*******************************************************/

    const name = values.nickname.trim();

    if (!nicknamePattern.test(name)) {
      setNicknameStatus("invalid");
      setNicknameCheckedValue("");
      return;
    }

    const requestId = ++nicknameRequest.current;

    try {
      const response = await checkNickname(name);

      if (requestId !== nicknameRequest.current) return;

      const available = response?.data?.available;

      if (typeof available !== "boolean") {
        throw new Error("닉네임 중복 확인 응답 형식을 확인해주세요.");
      }

      setNicknameStatus(available ? "available" : "duplicate");

      setNicknameCheckedValue(name);
    } catch (error) {
      if (requestId !== nicknameRequest.current) return;

      setNicknameStatus("error");
      console.error("닉네임 중복 확인 실패", error);
    }
  };

  const selectFile = (selected) => {
    if (!selected) return;

    const validExtension = /\.(pdf|jpe?g)$/i.test(selected.name);

    const validType = ["application/pdf", "image/jpeg", ""].includes(
      selected.type,
    );

    if (!validExtension || !validType) {
      setFile(null);
      setFileError(
        `pdf, jpg 파일만 올릴 수 있어요 (선택한 파일: ${selected.name})`,
      );
    } else if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileError(
        `10MB 이하 파일만 올릴 수 있어요 (선택한 파일: ${fileSize(selected.size)})`,
      );
    } else {
      setFile(selected);
      setFileError("");
    }
  };

  // 신분 확인 서류 안내 모달
  const openGuide = () => {
    clearTimeout(guideTimer.current);

    setShowGuide(true);

    guideTimer.current = setTimeout(() => {
      setShowGuide(false);
    }, 5000);
  };

  const closeGuide = () => {
    clearTimeout(guideTimer.current);
    setShowGuide(false);
  };

  const validate = () => {
    const next = {};

    if (!values.nickname.trim()) {
      next.nickname = "닉네임을 입력해주세요";
    } else if (!nicknamePattern.test(values.nickname.trim())) {
      next.nickname =
        "2~10자의 한글·영문·숫자만 쓸 수 있어요 (특수문자·공백 불가)";
    } else if (!nicknameValid) {
      next.nickname = "닉네임 중복 확인을 해주세요";
    }

    if (!values.email.trim()) {
      next.email = "이메일을 입력해주세요";
    } else if (!emailPattern.test(values.email.trim())) {
      next.email = "이메일 형식이 올바르지 않아요 (예: name@inu.ac.kr)";
    }

    if (!values.studentId) {
      next.studentId = "학번을 입력해주세요";
    } else if (!/^\d{9}$/.test(values.studentId)) {
      next.studentId = "학번은 숫자 9자리로 입력해주세요";
    }

    if (!values.password) {
      next.password = "비밀번호를 입력해주세요";
    } else if (!passwordValid) {
      next.password = "영문과 숫자를 각 1자 이상 포함해 8자 이상 입력해주세요";
    }

    if (!values.confirm) {
      next.confirm = "비밀번호를 한 번 더 입력해주세요";
    } else if (values.password !== values.confirm) {
      next.confirm = "비밀번호가 일치하지 않아요";
    }

    if (!file) {
      next.file = fileError || "신분 확인 서류를 첨부해주세요";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!validate() || loading) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("studentId", values.studentId);
      formData.append("password", values.password);
      formData.append("nickname", values.nickname.trim());
      formData.append("email", values.email.trim());
      formData.append("file", file);

      await signup(formData);

      setComplete(true);
      setErrors({});
    } catch (error) {
      console.error("회원가입 실패", error);

      const message =
        error.response?.data?.message ||
        "가입 신청 중 오류가 발생했어요 잠시 후 다시 시도해주세요";

      const lower = message.toLowerCase();

      if (lower.includes("email") || message.includes("이메일")) {
        setErrors((old) => ({
          ...old,
          email:
            "이미 가입된 이메일이에요 로그인 또는 비밀번호 찾기를 이용해주세요",
        }));
      } else if (lower.includes("student") || message.includes("학번")) {
        setErrors((old) => ({
          ...old,
          studentId:
            "이미 가입된 학번이에요 본인이 아니라면 관리자에게 문의해주세요",
        }));
      } else {
        setErrors((old) => ({
          ...old,
          server: message,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (key, success = false) =>
    `${styles.field} ${
      submitted && errors[key] ? styles.invalid : success ? styles.valid : ""
    }`;

  const errorMessage = (key) =>
    submitted && errors[key] ? (
      <p className={styles.errorText}>{errors[key]}</p>
    ) : null;

  const leave = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeave(true);
    }
  }, [blocker.state]);

  if (complete) {
    return (
      <div className={styles.page}>
        <Header />

        <main className={styles.complete}>
          <span className={styles.completeIcon}>
            <Check size={34} />
          </span>

          <h1>가입 신청이 완료되었어요</h1>

          <p>
            운영진이 서류를 확인한 뒤 1~2일 안에 승인해드려요
            <br />
            승인 결과는 <strong>{values.email}</strong> 로 알려드릴게요
          </p>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            메인으로 가기
          </button>
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
          <h1>회원가입</h1>
          <span>모든 항목을 입력해주세요</span>
        </div>

        {submitted && Object.keys(errors).length > 0 && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={19} />
            입력하지 않았거나 올바르지 않은 항목이 있어요 빨간색으로 표시된 칸을
            확인해주세요
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <label htmlFor="nickname">닉네임</label>

            <div className={styles.control}>
              <div className={styles.nicknameLine}>
                <div
                  className={`${fieldClass(
                    "nickname",
                    nicknameStatus === "available",
                  )} ${styles.nicknameField}`}
                >
                  <input
                    id="nickname"
                    value={values.nickname}
                    onChange={(e) => change("nickname", e.target.value)}
                    placeholder="ex. 물먹은다람쥐"
                  />

                  <button
                    type="button"
                    onClick={checkName}
                    disabled={nicknameStatus === "available"}
                  >
                    중복 확인
                  </button>
                </div>

                {nicknameStatus === "available" && (
                  <Check className={styles.statusIcon} size={22} />
                )}

                {["duplicate", "invalid"].includes(nicknameStatus) && (
                  <X className={styles.statusIconError} size={22} />
                )}
              </div>

              {nicknameStatus === "available" && (
                <p className={styles.successText}>
                  사용할 수 있는 닉네임이에요
                </p>
              )}

              {nicknameStatus === "duplicate" && (
                <p className={styles.errorText}>이미 사용 중인 닉네임이에요</p>
              )}

              {nicknameStatus === "invalid" && (
                <p className={styles.errorText}>
                  2~10자의 한글·영문·숫자만 쓸 수 있어요 (특수문자·공백 불가)
                </p>
              )}

              {!nicknameStatus &&
                (errorMessage("nickname") || (
                  <p className={styles.hint}>2~10자, 한글·영문·숫자</p>
                ))}
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="email">이메일</label>

            <div className={styles.control}>
              <div
                className={fieldClass(
                  "email",
                  submitted && !errors.email && !!values.email,
                )}
              >
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => change("email", e.target.value)}
                  placeholder="ex. name@inu.ac.kr"
                />
              </div>

              {errorMessage("email")}
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="studentId">학번</label>

            <div className={styles.control}>
              <div
                className={fieldClass(
                  "studentId",
                  submitted && !errors.studentId && !!values.studentId,
                )}
              >
                <input
                  id="studentId"
                  inputMode="numeric"
                  maxLength={9}
                  value={values.studentId}
                  onChange={(e) =>
                    change("studentId", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="ex. 202301589"
                />
              </div>

              {errorMessage("studentId")}
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="password">비밀번호</label>

            <div className={styles.control}>
              <div
                className={fieldClass(
                  "password",
                  !!values.password && passwordValid,
                )}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(e) => change("password", e.target.value)}
                  placeholder="ex. 영문·숫자 각 1자 이상 포함"
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  aria-label={
                    showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                  }
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {submitted && errors.password && (
                <p className={styles.errorText}>{errors.password}</p>
              )}

              <div className={styles.rules}>
                {[
                  ["length", "8자 이상"],
                  ["english", "영문 포함"],
                  ["number", "숫자 포함"],
                ].map(([key, label]) => (
                  <span
                    key={key}
                    className={
                      values.password
                        ? rules[key]
                          ? styles.rulePass
                          : styles.ruleFail
                        : styles.ruleIdle
                    }
                  >
                    {values.password ? (
                      rules[key] ? (
                        <Check size={13} />
                      ) : (
                        <X size={13} />
                      )
                    ) : (
                      <span className={styles.dot}>◦</span>
                    )}

                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="confirm">비밀번호 확인</label>

            <div className={styles.control}>
              <div
                className={fieldClass(
                  "confirm",
                  submitted && !errors.confirm && !!values.confirm,
                )}
              >
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={values.confirm}
                  onChange={(e) => change("confirm", e.target.value)}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  aria-label={
                    showConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"
                  }
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {submitted && !errors.confirm && values.confirm && (
                <p className={styles.successText}>비밀번호가 일치해요</p>
              )}

              {errorMessage("confirm")}
            </div>
          </div>

          <div className={styles.row}>
            <label htmlFor="verificationFile">신분 확인 서류</label>

            <div className={styles.control}>
              <div className={styles.fileLine}>
                <div
                  className={`${fieldClass(
                    "file",
                    !!file && !fileError,
                  )} ${dragging ? styles.dragging : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    selectFile(e.dataTransfer.files[0]);
                  }}
                >
                  {file ? (
                    <div className={styles.selectedFile}>
                      <FileText size={17} />

                      <span>
                        {file.name} · {fileSize(file.size)}
                      </span>

                      <button
                        type="button"
                        aria-label="첨부 파일 삭제"
                        onClick={() => {
                          setFile(null);
                          setFileError("");

                          if (fileRef.current) {
                            fileRef.current.value = "";
                          }
                        }}
                      >
                        <X size={17} />
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
                  aria-label="신분 확인 서류 안내"
                  onMouseEnter={openGuide}
                  onFocus={openGuide}
                  onClick={openGuide}
                >
                  <Info size={21} />
                </button>
              </div>

              <input
                ref={fileRef}
                id="verificationFile"
                className={styles.hiddenInput}
                type="file"
                accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                onChange={(e) => selectFile(e.target.files?.[0])}
              />

              {fileError && <p className={styles.errorText}>{fileError}</p>}

              {!fileError && errorMessage("file")}

              {file && !fileError && (
                <p className={styles.successText}>업로드 완료</p>
              )}
            </div>
          </div>

          {submitted && errors.server && (
            <p className={styles.serverError}>{errors.server}</p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            가입 신청하기
          </button>

          <p className={styles.loginText}>
            이미 계정이 있나요?{" "}
            <button type="button" onClick={leave}>
              로그인
            </button>
          </p>
        </form>
      </main>

      <Footer />

      {showGuide && (
        <div
          className={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeGuide();
            }
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
              onClick={closeGuide}
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
              onClick={closeGuide}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showLeave && (
        <div className={styles.overlay}>
          <div
            className={`${styles.modal} ${styles.leaveModal}`}
            role="dialog"
            aria-modal="true"
            aria-label="회원가입 중단 확인"
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => {
                setShowLeave(false);

                if (blocker.state === "blocked") {
                  blocker.reset();
                }
              }}
              aria-label="닫기"
            >
              <X size={19} />
            </button>

            <h2>회원가입을 그만둘까요?</h2>
            <p>지금 나가면 입력한 내용이 저장되지 않아요</p>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setShowLeave(false);

                  if (blocker.state === "blocked") {
                    blocker.proceed();
                  }
                }}
              >
                나가기
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLeave(false);

                  if (blocker.state === "blocked") {
                    blocker.reset();
                  }
                }}
              >
                계속 작성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
