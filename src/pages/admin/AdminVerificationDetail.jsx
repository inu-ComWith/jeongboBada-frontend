import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import styles from "./AdminVerificationDetail.module.css";
import {
  approveVerification,
  getVerification,
  getVerifications,
  rejectVerification,
} from "../../api/admin";
import {
  STATUS_LABEL,
  daysSince,
  formatDate,
  formatDocumentType,
  isPdf,
  redirectOnAuthError,
} from "../../components/admin/adminUtils";

const LIST_PATH = "/admin/verifications";

// documentUrl은 5분 뒤 만료되므로 4분마다 새 주소를 받는다.
const URL_REFRESH_MS = 4 * 60 * 1000;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

const CHECKLIST = [
  "이름 식별 가능",
  "학번이 입력값과 일치",
  "인정 서류 5종 중 하나",
  "주민번호 등 불필요 정보 가림",
];

const OTHER_REASON = "기타 (직접 입력)";
const REASONS = [
  "이름/학번이 잘 보이지 않음 (흐린 이미지)",
  "인정 서류가 아님",
  "입력 정보와 서류 불일치",
  "개인정보(주민번호 등) 미가림",
  OTHER_REASON,
];
const REASON_MAX = 200;

const listPathFor = (status) =>
  status && status !== "PENDING" ? `${LIST_PATH}?status=${status}` : LIST_PATH;

// B-2 가입 신청 검토. 신청이 바뀌면 key로 화면 상태(체크리스트·사유·확대 등)를 통째로 초기화한다.
function AdminVerificationDetail() {
  const { userId } = useParams();
  return <VerificationReview key={userId} userId={userId} />;
}

function VerificationReview({ userId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshPendingCount } = useOutletContext() ?? {};

  const [detail, setDetail] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [siblings, setSiblings] = useState(null);
  const [notice] = useState(location.state?.notice ?? null);

  // 서류 미리보기
  const [urlError, setUrlError] = useState(null);
  const [refreshingUrl, setRefreshingUrl] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [autoRetried, setAutoRetried] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 검토·처리
  const [checks, setChecks] = useState(() => CHECKLIST.map(() => false));
  const [mode, setMode] = useState(null); // "approve" | "reject"
  const [reasonIndex, setReasonIndex] = useState(null);
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const applicant = detail?.applicant;
  const status = applicant?.status;
  const documentUrl = detail?.documentUrl;

  const goToList = useCallback(
    (message, targetStatus) =>
      navigate(listPathFor(targetStatus), {
        replace: true,
        state: message ? { notice: message } : null,
      }),
    [navigate],
  );

  // 공통 에러 분기. 화면 이동으로 처리했으면 true.
  const handleNavigationError = useCallback(
    (error) => {
      if (redirectOnAuthError(error, navigate)) return true;
      if (error?.code === "USER_NOT_FOUND" || error?.status === 404) {
        goToList("없는 신청이에요. 목록으로 돌아왔어요.");
        return true;
      }
      if (error?.code === "VERIFICATION_ALREADY_PROCESSED") {
        goToList("다른 관리자가 이미 처리했어요. 목록을 새로 불러왔어요.");
        return true;
      }
      return false;
    },
    [navigate, goToList],
  );

  // 상세 조회
  useEffect(() => {
    let ignore = false;
    getVerification(userId)
      .then((data) => {
        if (!ignore) setDetail(data);
      })
      .catch((error) => {
        if (ignore || handleNavigationError(error)) return;
        setLoadError(error);
      });
    return () => {
      ignore = true;
    };
  }, [userId, retryKey, handleNavigationError]);

  // 이전/다음 신청 계산용: 같은 상태의 목록(서버 정렬 순서)
  useEffect(() => {
    if (!status) return undefined;
    let ignore = false;
    getVerifications(status)
      .then((list) => {
        if (!ignore) setSiblings(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!ignore) setSiblings([]);
      });
    return () => {
      ignore = true;
    };
  }, [status]);

  // 상세를 다시 불러 새 서류 주소로 바꾼다 (만료 대비).
  const refreshDocumentUrl = useCallback(() => {
    setRefreshingUrl(true);
    return getVerification(userId)
      .then((data) => {
        setDetail(data);
        setUrlError(null);
        setImageFailed(false);
      })
      .catch((error) => {
        if (handleNavigationError(error)) return;
        setUrlError(
          error?.code === "FILE_URL_FAILED"
            ? "서류 주소를 만들지 못했어요. 다시 시도해 주세요."
            : error.message,
        );
      })
      .finally(() => setRefreshingUrl(false));
  }, [userId, handleNavigationError]);

  useEffect(() => {
    if (!documentUrl) return undefined;
    const timer = setInterval(refreshDocumentUrl, URL_REFRESH_MS);
    return () => clearInterval(timer);
  }, [documentUrl, refreshDocumentUrl]);

  // 상세 화면으로 넘어온 안내는 한 번만 보여주고 history state에서 지운다.
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleImageError = () => {
    // 만료된 주소일 수 있으니 한 번은 자동으로 새 주소를 받아 본다.
    if (!autoRetried) {
      setAutoRetried(true);
      refreshDocumentUrl();
      return;
    }
    setImageFailed(true);
  };

  // 이전/다음
  const currentIndex = siblings
    ? siblings.findIndex((item) => String(item.userId) === String(userId))
    : -1;
  const prevItem = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  const goToApplicant = (item) =>
    navigate(`${LIST_PATH}/${item.userId}`);

  // 반려 사유: 고른 문구를 그대로 보낸다. 기타면 입력값.
  const isOther = REASONS[reasonIndex] === OTHER_REASON;
  const reason =
    reasonIndex == null ? "" : isOther ? otherReason.trim() : REASONS[reasonIndex];
  const reasonValid = reason.length > 0 && reason.length <= REASON_MAX;

  // 처리 후: 목록 순서상 다음 대기 신청으로, 없으면 목록으로.
  const moveToNextPending = async (message) => {
    const fresh = await getVerifications("PENDING").catch(() => null);
    const pool = (Array.isArray(fresh) ? fresh : (siblings ?? [])).filter(
      (item) => String(item.userId) !== String(userId),
    );
    const oldOrder = (siblings ?? []).map((item) => String(item.userId));
    const next =
      pool.find(
        (item) => oldOrder.indexOf(String(item.userId)) > currentIndex,
      ) ?? pool[0];

    if (next) {
      navigate(`${LIST_PATH}/${next.userId}`, {
        replace: true,
        state: { notice: `${message} 다음 대기 신청이에요.` },
      });
    } else {
      goToList(`${message} 대기 중인 신청을 모두 처리했어요.`);
    }
  };

  const handleSubmit = async () => {
    if (submitting || !mode) return;
    if (mode === "reject" && !reasonValid) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (mode === "approve") {
        await approveVerification(userId);
      } else {
        await rejectVerification(userId, reason);
      }
      refreshPendingCount?.();
      const name = applicant?.nickname ?? "신청자";
      await moveToNextPending(
        mode === "approve"
          ? `${name}님의 가입을 승인했어요.`
          : `${name}님의 가입을 반려했어요.`,
      );
    } catch (error) {
      setSubmitting(false);
      if (error?.code === "VERIFICATION_ALREADY_PROCESSED") {
        refreshPendingCount?.();
      }
      if (handleNavigationError(error)) return;
      if (error?.code === "INVALID_INPUT_VALUE") {
        setSubmitError(
          `반려 사유를 확인해 주세요. (필수, ${REASON_MAX}자 이하) ${error.message ?? ""}`.trim(),
        );
        return;
      }
      setSubmitError(error.message);
    }
  };

  if (loadError) {
    return (
      <div className={styles.page}>
        <Breadcrumb status={status} />
        <div className={styles.stateBox}>
          <p className={styles.errorText}>
            {loadError.code === "FILE_URL_FAILED"
              ? "서류 주소를 만들지 못했어요. 다시 시도해 주세요."
              : loadError.message}
          </p>
          <button
            type="button"
            className={styles.outlineButton}
            onClick={() => {
              setLoadError(null);
              setRetryKey((key) => key + 1);
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.page}>
        <Breadcrumb />
        <div className={styles.stateBox}>
          신청 정보를 불러오는 중이에요… (서버가 깨어나는 중이면 수십 초 걸릴 수
          있어요)
        </div>
      </div>
    );
  }

  const days = daysSince(applicant.appliedAt);
  const isPendingApplicant = status === "PENDING";
  const pdf = isPdf(applicant.documentType);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Breadcrumb status={status} />
          <h1 className={styles.title}>가입 신청 검토 · {applicant.nickname}</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.outlineButton}
            disabled={!prevItem}
            onClick={() => goToApplicant(prevItem)}
          >
            이전 신청
          </button>
          <button
            type="button"
            className={styles.outlineButton}
            disabled={!nextItem}
            onClick={() => goToApplicant(nextItem)}
          >
            다음 신청
          </button>
        </div>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      )}

      <div className={styles.grid}>
        {/* 서류 미리보기 */}
        <section className={`${styles.card} ${styles.docCard}`}>
          <div className={styles.docHeader}>
            <h2 className={styles.cardTitle}>
              신분 확인 서류 · {formatDocumentType(applicant.documentType)}
            </h2>
            <div className={styles.docTools}>
              <button
                type="button"
                className={styles.toolButton}
                disabled={!documentUrl || zoom <= ZOOM_MIN}
                onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              >
                축소
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={!documentUrl}
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                }}
                title="원래 크기로"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={!documentUrl || zoom >= ZOOM_MAX}
                onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              >
                확대
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={!documentUrl}
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                회전
              </button>
              <button
                type="button"
                className={styles.toolButton}
                disabled={!documentUrl || refreshingUrl}
                onClick={refreshDocumentUrl}
              >
                {refreshingUrl ? "불러오는 중…" : "다시 불러오기"}
              </button>
            </div>
          </div>

          <div className={styles.viewer}>
            {!documentUrl ? (
              <p className={styles.viewerMessage}>서류가 삭제되었습니다.</p>
            ) : imageFailed ? (
              <div className={styles.viewerMessage}>
                <p>서류를 불러오지 못했어요.</p>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={refreshDocumentUrl}
                >
                  다시 불러오기
                </button>
              </div>
            ) : (
              <div
                className={styles.docStage}
                style={{
                  width: `${zoom * 100}%`,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {pdf ? (
                  <iframe
                    key={documentUrl}
                    src={documentUrl}
                    title="신분 확인 서류"
                    className={styles.pdf}
                    style={{ height: `${Math.round(720 * zoom)}px` }}
                  />
                ) : (
                  <img
                    key={documentUrl}
                    src={documentUrl}
                    alt="신분 확인 서류"
                    className={styles.image}
                    onError={handleImageError}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                )}
              </div>
            )}
          </div>

          {urlError && <p className={styles.errorText}>{urlError}</p>}
          <p className={styles.caption}>
            서류 주소는 5분 뒤 만료돼요. 4분마다 자동으로 새로 받고, 미리보기가
            깨지면 "다시 불러오기"를 눌러 주세요. 처리하면 서류는 삭제됩니다.
          </p>
        </section>

        <div className={styles.side}>
          {/* 신청 정보 */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>신청 정보</h2>
            <dl className={styles.info}>
              <dt>닉네임</dt>
              <dd>{applicant.nickname}</dd>
              <dt>학번</dt>
              <dd>
                {applicant.studentId}{" "}
                <span className={styles.hint}>(검토 중 전체 표시)</span>
              </dd>
              <dt>이메일</dt>
              <dd>{applicant.email || "-"}</dd>
              <dt>신청일</dt>
              <dd>
                {formatDate(applicant.appliedAt)}
                {days != null && ` · ${days}일 경과`}
              </dd>
              <dt>상태</dt>
              <dd>{STATUS_LABEL[status] ?? status}</dd>
              {!isPendingApplicant && (
                <>
                  <dt>처리일</dt>
                  <dd>{formatDate(applicant.processedAt)}</dd>
                </>
              )}
              {status === "REJECTED" && (
                <>
                  <dt>반려 사유</dt>
                  <dd>{applicant.rejectionReason || "-"}</dd>
                </>
              )}
            </dl>
          </section>

          {/* 대조 체크리스트 (화면에서만, 저장 안 함) */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>대조 체크리스트</h2>
            <ul className={styles.checklist}>
              {CHECKLIST.map((label, index) => (
                <li key={label}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={checks[index]}
                      onChange={(e) =>
                        setChecks((prev) =>
                          prev.map((v, i) => (i === index ? e.target.checked : v)),
                        )
                      }
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>체크 내용은 저장되지 않아요.</p>
          </section>

          {/* 처리 */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>처리</h2>

            {!isPendingApplicant ? (
              <p className={styles.processed}>
                {formatDate(applicant.processedAt)}에{" "}
                {STATUS_LABEL[status] ?? status}된 신청이에요.
              </p>
            ) : (
              <>
                <div className={styles.modeButtons}>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${mode === "approve" ? styles.modeActive : ""}`}
                    aria-pressed={mode === "approve"}
                    onClick={() => {
                      setMode("approve");
                      setSubmitError(null);
                    }}
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${mode === "reject" ? styles.modeActive : ""}`}
                    aria-pressed={mode === "reject"}
                    onClick={() => {
                      setMode("reject");
                      setSubmitError(null);
                    }}
                  >
                    반려
                  </button>
                </div>

                {mode === "approve" && (
                  <p className={styles.approveText}>
                    승인하면 서류가 삭제되고 승인 메일이 발송돼요.
                  </p>
                )}

                {mode === "reject" && (
                  <fieldset className={styles.reasons}>
                    <legend className={styles.legend}>반려 사유 (필수)</legend>
                    {REASONS.map((label, index) => (
                      <label key={label} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="reject-reason"
                          checked={reasonIndex === index}
                          onChange={() => setReasonIndex(index)}
                        />
                        {label}
                      </label>
                    ))}
                    {isOther && (
                      <div className={styles.otherWrap}>
                        <textarea
                          className={styles.textarea}
                          placeholder="기타 사유 입력"
                          value={otherReason}
                          maxLength={REASON_MAX}
                          onChange={(e) => setOtherReason(e.target.value)}
                          autoFocus
                        />
                        <span className={styles.counter}>
                          {otherReason.trim().length}/{REASON_MAX}
                        </span>
                      </div>
                    )}

                    <div className={styles.popupPreview}>
                      <p className={styles.popupLabel}>사용자 로그인 팝업 미리보기</p>
                      <p className={styles.popupTitle}>가입이 반려되었어요</p>
                      <p className={styles.popupBody}>
                        반려 사유 · {reason || "사유를 고르면 여기에 보여요"}
                      </p>
                    </div>
                  </fieldset>
                )}

                {submitError && (
                  <p className={styles.errorText} role="alert">
                    {submitError}
                  </p>
                )}

                {mode && (
                  <button
                    type="button"
                    className={styles.submitButton}
                    disabled={submitting || (mode === "reject" && !reasonValid)}
                    onClick={handleSubmit}
                  >
                    {submitting
                      ? "처리 중…"
                      : mode === "approve"
                        ? "승인하기"
                        : "반려하고 메일 발송"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ status }) {
  return (
    <p className={styles.breadcrumb}>
      <Link to={listPathFor(status)} className={styles.breadcrumbLink}>
        가입 승인
      </Link>{" "}
      / B-2
    </p>
  );
}

export default AdminVerificationDetail;
