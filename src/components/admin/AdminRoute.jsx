import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

import { getMe, hasAccessToken } from "../../api/admin";
import { redirectOnAuthError } from "./adminUtils";
import styles from "./AdminLayout.module.css";

// /admin/* 권한 가드. 화면 노출용이고, 실제 권한은 백엔드가 403으로 막는다.
function AdminRoute() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const hasToken = hasAccessToken();

  useEffect(() => {
    if (!hasToken) return undefined;
    let ignore = false;

    getMe()
      .then((data) => {
        if (ignore) return;
        if (data?.role !== "ADMIN") {
          navigate("/", { replace: true });
          return;
        }
        setMe(data);
      })
      .catch((err) => {
        if (ignore) return;
        if (!redirectOnAuthError(err, navigate)) setError(err);
      });

    return () => {
      ignore = true;
    };
  }, [hasToken, navigate, retryKey]);

  if (!hasToken) return <Navigate to="/login" replace />;

  if (error) {
    return (
      <div className={styles.guard}>
        <p>{error.message}</p>
        <button
          type="button"
          className={styles.guardButton}
          onClick={() => {
            setError(null);
            setRetryKey((key) => key + 1);
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!me) {
    return (
      <div className={styles.guard}>
        <p>관리자 권한을 확인하고 있어요…</p>
        <p className={styles.guardSub}>서버가 깨어나는 중이면 수십 초 걸릴 수 있어요.</p>
      </div>
    );
  }

  return <Outlet context={{ me }} />;
}

export default AdminRoute;
