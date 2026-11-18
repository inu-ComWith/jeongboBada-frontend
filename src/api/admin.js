import axios from "axios";

// 관리자 API 전용 클라이언트.
// 공용 apiClient(src/api/axios.js)는 팀원이 토큰 처리를 넣을 예정이라 건드리지 않고,
// 여기서 요청마다 accessToken을 Authorization 헤더에 붙인다.
const adminClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 배포 서버(Render)는 잠들어 있으면 첫 요청에 수십 초가 걸린다.
  timeout: 60000,
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 서버 공통 응답 { success, data, code, message, errors? } 의 에러를 화면에서 쓰기 쉬운 형태로 바꾼다.
export class AdminApiError extends Error {
  constructor({ status, code, message, errors }) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const toAdminError = (error) => {
  if (error instanceof AdminApiError) return error;

  const response = error?.response;
  if (!response) {
    return new AdminApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message:
        error?.code === "ECONNABORTED"
          ? "서버 응답이 너무 늦어요. 잠시 후 다시 시도해 주세요."
          : "서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.",
    });
  }

  const body = response.data ?? {};
  return new AdminApiError({
    status: response.status,
    code: body.code,
    message: body.message || "요청을 처리하지 못했어요.",
    errors: body.errors,
  });
};

const request = async (config) => {
  try {
    const response = await adminClient.request(config);
    const body = response.data ?? {};
    if (body.success === false) {
      throw new AdminApiError({
        status: response.status,
        code: body.code,
        message: body.message || "요청을 처리하지 못했어요.",
        errors: body.errors,
      });
    }
    return body.data;
  } catch (error) {
    throw toAdminError(error);
  }
};

export const hasAccessToken = () => Boolean(localStorage.getItem("accessToken"));

// 내 정보 { nickname, studentId, email, department, role }
export const getMe = () => request({ method: "get", url: "/api/users/me" });

// 헤더처럼 페이지마다 다시 그려지는 곳에서 쓰는 캐시 버전. 토큰이 바뀌면 다시 조회한다.
let meCache = { token: null, promise: null };
export const getMeCached = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return Promise.reject(new AdminApiError({ status: 401 }));
  if (meCache.token !== token || !meCache.promise) {
    const promise = getMe().catch((error) => {
      if (meCache.promise === promise) meCache = { token: null, promise: null };
      throw error;
    });
    meCache = { token, promise };
  }
  return meCache.promise;
};

// status: "PENDING" | "APPROVED" | "REJECTED"
export const getVerifications = (status) =>
  request({ method: "get", url: "/api/admin/verifications", params: { status } });

// { applicant, documentUrl } — documentUrl은 5분 뒤 만료, 처리된 신청은 null
export const getVerification = (userId) =>
  request({ method: "get", url: `/api/admin/verifications/${userId}` });

export const approveVerification = (userId) =>
  request({ method: "post", url: `/api/admin/verifications/${userId}/approve` });

export const rejectVerification = (userId, reason) =>
  request({
    method: "post",
    url: `/api/admin/verifications/${userId}/reject`,
    data: { reason },
  });
