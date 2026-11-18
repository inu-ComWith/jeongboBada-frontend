import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import styles from "./AdminVerifications.module.css";
import { getVerifications } from "../../api/admin";
import {
  STATUS_LABEL,
  daysSince,
  formatDate,
  formatDocumentType,
  maskEmail,
  maskStudentId,
  redirectOnAuthError,
} from "../../components/admin/adminUtils";

const TABS = ["PENDING", "APPROVED", "REJECTED"];

// B-1 가입 승인 목록
function AdminVerifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingCount, refreshPendingCount } = useOutletContext() ?? {};
  const [searchParams, setSearchParams] = useSearchParams();

  const paramStatus = searchParams.get("status");
  const status = TABS.includes(paramStatus) ? paramStatus : "PENDING";

  // 결과를 조회한 status와 함께 저장해, 탭이 바뀌면 자연스럽게 "불러오는 중"이 된다.
  const [result, setResult] = useState({ key: null, items: [], error: null });
  const [counts, setCounts] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  const requestKey = `${status}:${reloadKey}`;
  const loading = result.key !== requestKey;

  useEffect(() => {
    let ignore = false;

    getVerifications(status)
      .then((data) => {
        if (ignore) return;
        const items = Array.isArray(data) ? data : [];
        setResult({ key: requestKey, items, error: null });
        setCounts((prev) => ({ ...prev, [status]: items.length }));
      })
      .catch((error) => {
        if (ignore || redirectOnAuthError(error, navigate)) return;
        setResult({ key: requestKey, items: [], error });
      });

    return () => {
      ignore = true;
    };
  }, [status, requestKey, navigate]);

  // 상세 화면에서 넘어온 안내(409 등)는 한 번만 보여주고 history state에서 지운다.
  useEffect(() => {
    if (location.state?.notice) {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  const changeTab = (next) => {
    setNotice(null);
    setSearchParams(next === "PENDING" ? {} : { status: next });
  };

  const reload = () => {
    setReloadKey((key) => key + 1);
    refreshPendingCount?.();
  };

  const tabCount = (tab) =>
    tab === "PENDING" ? (pendingCount ?? counts.PENDING) : counts[tab];

  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const columnCount = 8 + (isPending ? 0 : 1) + (isRejected ? 1 : 0);

  return (
    <div className={styles.page}>
      <p className={styles.code}>B-1</p>
      <h1 className={styles.title}>가입 승인</h1>
      <p className={styles.desc}>
        신분 확인 서류를 검토하고 승인 또는 반려합니다. 처리하면 서류는 자동으로
        삭제됩니다.
      </p>

      <div className={styles.tabs} role="tablist" aria-label="신청 상태">
        {TABS.map((tab) => {
          const count = tabCount(tab);
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={status === tab}
              className={`${styles.tab} ${status === tab ? styles.tabActive : ""}`}
              onClick={() => changeTab(tab)}
            >
              {STATUS_LABEL[tab]}
              {count != null && ` ${count}`}
            </button>
          );
        })}
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          <span>{notice}</span>
          <button
            type="button"
            className={styles.noticeClose}
            onClick={() => setNotice(null)}
            aria-label="안내 닫기"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.outlineButton}
          onClick={reload}
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>신청일</th>
              <th>경과</th>
              {!isPending && <th>처리일</th>}
              <th>닉네임</th>
              <th>학번</th>
              <th>이메일</th>
              <th>서류</th>
              <th>상태</th>
              {isRejected && <th>반려 사유</th>}
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  불러오는 중이에요… (서버가 깨어나는 중이면 수십 초 걸릴 수 있어요)
                </td>
              </tr>
            )}

            {!loading && result.error && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  <p className={styles.errorText}>{result.error.message}</p>
                  <button
                    type="button"
                    className={styles.outlineButton}
                    onClick={reload}
                  >
                    다시 시도
                  </button>
                </td>
              </tr>
            )}

            {!loading && !result.error && result.items.length === 0 && (
              <tr>
                <td colSpan={columnCount} className={styles.stateCell}>
                  {STATUS_LABEL[status]} 상태인 신청이 없어요.
                </td>
              </tr>
            )}

            {!loading &&
              !result.error &&
              result.items.map((item) => {
                const days = daysSince(item.appliedAt);
                return (
                  <tr key={item.userId}>
                    <td>{formatDate(item.appliedAt)}</td>
                    <td
                      className={
                        isPending && days >= 2 ? styles.overdue : undefined
                      }
                    >
                      {days == null ? "-" : `${days}일`}
                    </td>
                    {!isPending && <td>{formatDate(item.processedAt)}</td>}
                    <td>{item.nickname}</td>
                    <td>{maskStudentId(item.studentId)}</td>
                    <td>{maskEmail(item.email)}</td>
                    <td>{formatDocumentType(item.documentType)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[item.status]}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>
                    {isRejected && (
                      <td className={styles.reason}>
                        {item.rejectionReason || "-"}
                      </td>
                    )}
                    <td>
                      <button
                        type="button"
                        className={styles.reviewButton}
                        onClick={() =>
                          navigate(`/admin/verifications/${item.userId}`)
                        }
                      >
                        검토
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <p className={styles.footnote}>
        정렬: 대기는 먼저 신청한 순, 승인·반려는 최근 처리 순 · 2일 이상 경과한
        대기 건은 굵게 표시 · 학번·이메일 마스킹
      </p>
    </div>
  );
}

export default AdminVerifications;
