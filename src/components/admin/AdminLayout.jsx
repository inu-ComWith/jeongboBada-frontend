import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";

import styles from "./AdminLayout.module.css";
import logoImg from "../../assets/logo.png";
import { getVerifications } from "../../api/admin";

// path가 없는 메뉴는 아직 구현 전이라 비활성(클릭 불가)으로 둔다.
const MENUS = [
  { label: "대시보드" },
  { label: "가입 승인", path: "/admin/verifications", badge: "pending" },
  // 회원 관리 화면(AdminMembers)은 가짜 데이터라 API 연결 전까지 막아 둔다.
  { label: "회원 관리" },
  { label: "강의·교수 관리" },
  { label: "후기 관리" },
  { label: "신고 관리" },
  { label: "학습자료 관리" },
  { label: "운영 설정" },
  { label: "관리자·감사 로그" },
];

function AdminLayout() {
  const { me } = useOutletContext() ?? {};
  const [pendingCount, setPendingCount] = useState(null);

  // 사이드바 "가입 승인" 숫자 = 대기 목록 개수. 승인·반려 후 하위 화면에서 다시 부른다.
  const refreshPendingCount = useCallback(
    () =>
      getVerifications("PENDING")
        .then((list) => setPendingCount(Array.isArray(list) ? list.length : null))
        .catch(() => setPendingCount(null)),
    [],
  );

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src={logoImg} alt="" className={styles.logo} />
          <div>
            <p className={styles.brandName}>정보바다</p>
            <p className={styles.brandSub}>관리자</p>
          </div>
        </div>

        <nav className={styles.nav} aria-label="관리자 메뉴">
          {MENUS.map((menu) =>
            menu.path ? (
              <NavLink
                key={menu.label}
                to={menu.path}
                className={({ isActive }) =>
                  `${styles.menu} ${isActive ? styles.active : ""}`
                }
              >
                {menu.label}
                {menu.badge === "pending" && pendingCount > 0 && (
                  <span className={styles.badge} aria-label={`대기 ${pendingCount}건`}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ) : (
              <span
                key={menu.label}
                className={`${styles.menu} ${styles.disabled}`}
                aria-disabled="true"
                title="준비 중인 메뉴입니다"
              >
                {menu.label}
              </span>
            ),
          )}
        </nav>

        <div className={styles.footer}>
          <span>{me?.nickname ? `${me.nickname} · 관리자` : "관리자"}</span>
          <NavLink to="/" className={styles.footerLink}>
            사이트로 이동
          </NavLink>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet context={{ me, pendingCount, refreshPendingCount }} />
      </main>
    </div>
  );
}

export default AdminLayout;
