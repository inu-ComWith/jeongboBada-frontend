// 관리자 화면 공통 도우미 (표시 형식, 인증 에러 이동)

export const STATUS_LABEL = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

const pad = (n) => String(n).padStart(2, "0");

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// "2026-11-02T10:00:00" → "2026.11.02"
export const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return "-";
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

// 오늘 - 신청일 (날짜 기준 일수)
export const daysSince = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  const today = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((end - start) / 86400000));
};

// "202301589" → "2023****89"
export const maskStudentId = (studentId) => {
  if (!studentId) return "-";
  const value = String(studentId);
  if (value.length <= 6) return `${value.slice(0, 2)}****`;
  return `${value.slice(0, 4)}****${value.slice(-2)}`;
};

// "rawater@inu.ac.kr" → "ra***@inu.ac.kr"
export const maskEmail = (email) => {
  if (!email) return "-";
  const [local, domain] = String(email).split("@");
  if (!domain) return `${local.slice(0, 2)}***`;
  return `${local.slice(0, 2)}***@${domain}`;
};

export const formatDocumentType = (type) => (type ? String(type).toUpperCase() : "-");

export const isPdf = (type) => String(type ?? "").toLowerCase() === "pdf";

// 401 → 로그인, 403 → 홈. 처리했으면 true.
export const redirectOnAuthError = (error, navigate) => {
  if (error?.status === 401) {
    navigate("/login", { replace: true });
    return true;
  }
  if (error?.status === 403) {
    navigate("/", { replace: true });
    return true;
  }
  return false;
};
