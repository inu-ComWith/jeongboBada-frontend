import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";

import { login } from "../../api/auth";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import styles from "./Login.module.css";
import logoImg from "../../assets/logo.png";

const MAX_ATTEMPTS = 5; //로그인 실패 허용 횟수

function Login() {
  /****************************** 테스트 ******************************/
  // const [testMode, setTestMode] = useState(import.meta.env.DEV);
  // const [testAttempts, setTestAttempts] = useState(0);
  /******************************************************************/

  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessToast, setShowSuccessToast] = useState(() =>
    Boolean(location.state?.passwordResetSuccess),
  );

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // 입력 필드 오류
  const [errors, setErrors] = useState({});

  // 로그인 오류 alert
  const [notice, setNotice] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // 로그인 제한 종료 시각
  const [lockUntil, setLockUntil] = useState(null);

  // 카운트다운
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!showSuccessToast) return;

    // 새로고침 시 알림이 다시 나타나지 않도록 이동 상태 제거
    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    const timer = setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showSuccessToast, navigate, location.pathname]);

  useEffect(() => {
    if (!lockUntil) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000); //1초 단위로 카운트다운

    return () => clearInterval(timer);
  }, [lockUntil]); //기존 타이머 정리 -> 타이머 중복 생성 방지

  const remainingSeconds = lockUntil
    ? Math.max(0, Math.ceil((lockUntil - now) / 1000))
    : 0;

  const isLocked = remainingSeconds > 0;

  const countdown = `${String(Math.floor(remainingSeconds / 60)).padStart(
    2,
    "0",
  )}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const handleStudentIdChange = (e) => {
    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");

    setStudentId(onlyNumbers.slice(0, 9));

    setErrors((prev) => ({
      ...prev,
      studentId: "",
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    setErrors((prev) => ({
      ...prev,
      password: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!studentId.trim()) {
      newErrors.studentId = "학번을 입력해주세요";
    } else if (studentId.trim().length !== 9) {
      newErrors.studentId = "학번은 숫자 9자리로 입력해주세요";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; //오류 저장 배열 길이가 0이면 true, 아니면 false 반환
  };

  const handleValidationErrors = (serverErrors) => {
    const newErrors = {};

    serverErrors.forEach(({ field, message }) => {
      if (field === "studentId") {
        newErrors.studentId = message;
      }

      if (field === "password") {
        newErrors.password = message;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length > 0;
  };

  const handleLoginError = (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const code = data?.code;
    const message = data?.message;

    if (!error.response) {
      setNotice({
        type: "error",
        message: "서버에 연결할 수 없습니다 잠시 후 다시 시도해주세요",
      });
      return;
    }

    if (status === 400 && code === "INVALID_INPUT_VALUE") {
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        handleValidationErrors(data.errors);
      } else {
        setNotice({
          type: "error",
          message: message || "입력값을 확인해주세요",
        });
      }
      return;
    }

    if (status === 404 && code === "STUDENT_ID_NOT_REGISTERED") {
      setErrors({
        studentId: "가입되지 않은 학번입니다",
      });
      return;
    }

    if (status === 401 && code === "INVALID_CREDENTIALS") {
      setErrors({
        password: "비밀번호가 올바르지 않습니다",
      });

      setNotice({
        type: "mismatch",
        attempts: null,
        message: message || "비밀번호가 올바르지 않습니다",
      });
      return;
    }

    if (status === 429 && code === "LOGIN_LOCKED") {
      const retryAfterHeader = error.response?.headers?.["retry-after"];

      const retryAfter = Number(retryAfterHeader);

      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        setLockUntil(Date.now() + retryAfter * 1000);
        setNow(Date.now());
      }

      setNotice({
        type: "locked",
        message:
          message ||
          "로그인 시도 횟수를 초과했습니다 잠시 후 다시 시도해주세요",
      });
      return;
    }

    if (status >= 500) {
      setNotice({
        type: "error",
        message: "서버 오류가 발생했습니다 잠시 후 다시 시도해주세요",
      });
      return;
    }

    setNotice({
      type: "error",
      message: message || "로그인에 실패했습니다",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || isLocked) return;

    setNotice(null);
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);

    /*************************** 테스트 ***************************/
    // if (import.meta.env.DEV && testMode) {
    //   setErrors({
    //     studentId: "가입되지 않은 학번입니다",
    //   });

    //   setNotice({
    //     type: "unregistered",
    //     message: "가입되지 않은 학번이에요 회원가입 후 이용해주세요",
    //   });

    //   setIsLoading(false);
    //   return;
    // }

    // if (import.meta.env.DEV && testMode) {
    //   const nextAttempts = testAttempts + 1;

    //   setTestAttempts(nextAttempts);

    //   if (nextAttempts >= 5) {
    //     const until = Date.now() + 10 * 60 * 1000;

    //     setLockUntil(until);
    //     setNow(Date.now());

    //     setNotice({
    //       type: "locked",
    //       message: "로그인 5회 실패로 10분 동안 로그인이 제한돼요",
    //     });
    //   } else {
    //     setErrors({
    //       password: "학번 또는 비밀번호가 일치하지 않습니다",
    //     });

    //     setNotice({
    //       type: "mismatch",
    //       attempts: nextAttempts,
    //       message: "학번 또는 비밀번호가 일치하지 않아요",
    //     });
    //   }

    //   setIsLoading(false);
    //   return;
    // }
    /************************************************************************/

    try {
      const result = await login({
        studentId,
        password,
      });

      if (
        !result.success ||
        !result.data?.accessToken ||
        !result.data?.refreshToken
      ) {
        throw new Error("INVALID_LOGIN_RESPONSE");
      }

      const { accessToken, refreshToken } = result.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그인 실패:", error);

      if (error.message === "INVALID_LOGIN_RESPONSE") {
        setNotice({
          type: "error",
          message: "로그인 응답을 처리할 수 없습니다",
        });
      } else {
        handleLoginError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.loginMain}>
        <section className={styles.loginSection}>
          <img
            src={logoImg}
            alt="정보바다 로고"
            className={styles.profileImage}
          />

          {location.state?.passwordResetSuccess && (
            <div className={styles.successToast} role="status">
              <CheckCircle2 size={17} />
              <span>
                비밀번호가 변경되었습니다 새 비밀번호로 로그인해주세요
              </span>
            </div>
          )}

          {notice && (
            <div className={styles.notice} role="alert">
              <AlertTriangle size={20} />

              <div>
                {notice.type === "mismatch" ? (
                  <>
                    {notice.message}
                    {notice.attempts !== null &&
                      ` (${notice.attempts}/${MAX_ATTEMPTS}회)`}

                    {notice.attempts !== null && (
                      <>
                        <br />
                        5회 틀리면 10분 동안 로그인이 제한돼요
                      </>
                    )}
                  </>
                ) : notice.type === "locked" ? (
                  <>
                    {notice.message}
                    <br />
                    비밀번호가 기억나지 않으면 비밀번호 찾기를 이용해주세요
                  </>
                ) : (
                  notice.message
                )}
              </div>
            </div>
          )}

          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputRow}>
              <label htmlFor="studentId">학번</label>

              <div className={styles.inputGroup}>
                <input
                  id="studentId"
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="ex. 202301589"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.studentId)}
                  className={errors.studentId ? styles.inputError : ""}
                />

                {errors.studentId && notice?.type !== "unregistered" && (
                  <span className={styles.errorText}>{errors.studentId}</span>
                )}
              </div>
            </div>

            <div className={styles.inputRow}>
              <label htmlFor="password">비밀번호</label>

              <div className={styles.inputGroup}>
                <div className={styles.passwordField}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="ex. 영문·숫자 각 1자 이상 포함"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    className={errors.password ? styles.inputError : ""}
                  />

                  <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>
            </div>

            <div className={styles.loginActions}>
              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading || isLocked}
              >
                {isLocked ? `${countdown} 후 다시 시도할 수 있어요` : "로그인"}
              </button>

              {notice?.type === "locked" ? (
                <Link to="/find-password" className={styles.secondaryButton}>
                  비밀번호 찾기
                </Link>
              ) : notice?.type === "unregistered" ? (
                <Link to="/signup" className={styles.secondaryButton}>
                  회원가입 하러 가기
                </Link>
              ) : (
                <div className={styles.helpActions}>
                  <Link to="/password-reset">계정을 잃어버렸어요</Link>

                  <span className={styles.separator} />

                  <Link to="/signup">아직 계정이 없으신가요?</Link>
                </div>
              )}
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
