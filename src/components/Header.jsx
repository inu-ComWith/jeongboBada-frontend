import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, UserRound, Lock } from "lucide-react";
import styles from "./Header.module.css";
import logoImg from "../assets/logo.png";
import { getMeCached } from "../api/admin";

function Header() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  return (
    <header className={styles.header}>
      <img
        src={logoImg}
        className={styles.logo}
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
          to="/lab/list"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          연구실
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
        <NavLink to="/my" className={styles.iconButton}>
          <UserRound size={24} strokeWidth={1.8} />
        </NavLink>
        <NavLink to="/login" className={styles.iconButton}>
          <Lock size={24} strokeWidth={1.8} />
        </NavLink>
      </div>
    </header>
  );
}

// 관리자 버튼 노출용 role 확인. 실제 권한은 백엔드가 막는다.
function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return undefined;
    let ignore = false;
    getMeCached()
      .then((me) => {
        if (!ignore) setIsAdmin(me?.role === "ADMIN");
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return isAdmin;
}

export default Header;
