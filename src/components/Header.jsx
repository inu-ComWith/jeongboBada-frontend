import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  UserRound,
  Lock,
  LogOut,
  X,
  CheckCircle2,
  Sun,
} from "lucide-react";

import styles from "./Header.module.css";
import logoImg from "../assets/logo.png";

import { getMeCached, clearMeCache } from "../api/admin";
import { logout } from "../api/auth";

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutToast, setLogoutToast] = useState(false);

  const profileRef = useRef(null);

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isLoggedIn) return;

    let ignore = false;

    getMeCached()
      .then((me) => {
        if (!ignore) setUser(me);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setLogoutModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await logout(refreshToken);
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      clearMeCache();

      setUser(null);
      setProfileOpen(false);
      setLogoutModalOpen(false);
      setLogoutLoading(false);

      setLogoutToast(true);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (!logoutToast) return;

    const timer = setTimeout(() => {
      setLogoutToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [logoutToast]);

  return (
    <>
      <header className={styles.header}>
        <img
          src={logoImg}
          className={styles.logo}
          alt="정보바다"
          onClick={() => navigate("/")}
        />

        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            홈
          </NavLink>

          <NavLink
            to="/professor/list"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            교수님 정보
          </NavLink>

          <NavLink
            to="/course"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            전공 강의평
          </NavLink>
        </nav>

        <div className={styles.actions}>
          {isAdmin && (
            <NavLink to="/admin" className={styles.adminButton}>
              관리자 페이지
            </NavLink>
          )}

          <button type="button" className={styles.iconButton}>
            <Search size={24} strokeWidth={1.8} />
          </button>

          {isLoggedIn ? (
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                type="button"
                className={styles.profileButton}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className={styles.profileAvatar} />
                <span className={styles.profileNickname}>
                  {user?.nickname || "사용자"}
                </span>
              </button>

              {profileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileInfo}>
                    <strong>{user?.nickname || "사용자"}</strong>
                    <span>{user?.email || ""}</span>
                  </div>

                  <div className={styles.profileMenu}>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/my");
                      }}
                    >
                      <UserRound size={17} />내 정보
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/reset-password");
                      }}
                    >
                      <Sun size={17} />
                      비밀번호 변경
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setLogoutModalOpen(true);
                      }}
                    >
                      <LogOut size={17} />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/my" className={styles.iconButton}>
                <UserRound size={24} strokeWidth={1.8} />
              </NavLink>

              <NavLink to="/login" className={styles.iconButton}>
                <Lock size={24} strokeWidth={1.8} />
              </NavLink>
            </>
          )}
        </div>
      </header>

      {logoutModalOpen && (
        <div className={styles.logoutOverlay}>
          <section
            className={styles.logoutModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logoutTitle"
          >
            <button
              type="button"
              className={styles.logoutClose}
              aria-label="닫기"
              onClick={() => setLogoutModalOpen(false)}
              disabled={logoutLoading}
            >
              <X size={19} />
            </button>

            <h2 id="logoutTitle">로그아웃 할까요?</h2>
            <p>다음에 이용하려면 다시 로그인해야 해요</p>

            <div className={styles.logoutActions}>
              <button
                type="button"
                className={styles.logoutCancel}
                onClick={() => setLogoutModalOpen(false)}
                disabled={logoutLoading}
              >
                취소
              </button>

              <button
                type="button"
                className={styles.logoutConfirm}
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </section>
        </div>
      )}

      {logoutToast && (
        <div className={styles.logoutToast} role="status">
          <CheckCircle2 size={17} />
          로그아웃 되었어요
        </div>
      )}
    </>
  );
}

export default Header;
