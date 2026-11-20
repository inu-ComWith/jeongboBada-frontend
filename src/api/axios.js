import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 인증 없이 호출하는 API
const PUBLIC_ENDPOINTS = [
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/reissue",
  "/api/auth/check-nickname",
  "/api/auth/password-reset/send-code",
  "/api/auth/password-reset/verify-code",
  "/api/auth/password-reset",
  "/api/auth/verification/resubmit",
];

// 토큰은 첨부하지만, 401이어도 재발급·로그인 이동을 하지 않는 API
// (로그아웃은 실패해도 화면에서 토큰을 지우고 처리하므로 재발급이 필요 없음)
const NO_REISSUE_ENDPOINTS = ["/api/auth/logout"];

const getPathname = (url = "") =>
  new URL(url, import.meta.env.VITE_API_BASE_URL || window.location.origin)
    .pathname;

const isPublicEndpoint = (url) => PUBLIC_ENDPOINTS.includes(getPathname(url));

const shouldSkipReissue = (url) =>
  isPublicEndpoint(url) || NO_REISSUE_ENDPOINTS.includes(getPathname(url));

// 1. 요청 시 Access Token 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    if (isPublicEndpoint(config.url)) {
      delete config.headers.Authorization;
      return config;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Access Token 재발급 요청 중복 방지
let reissuing = null;

// 3. Access Token 만료 시 재발급 후 기존 요청 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 401 + AUTHENTICATION_REQUIRED인 경우에만 재발급
    if (
      response?.status !== 401 ||
      response?.data?.code !== "AUTHENTICATION_REQUIRED" ||
      originalRequest._retry ||
      shouldSkipReissue(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // 여러 요청이 동시에 만료되어도 재발급은 한 번만 실행
      if (!reissuing) {
        reissuing = axios
          .post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reissue`, {
            refreshToken,
          })
          .then((res) => {
            const tokens = res.data?.data;

            if (!tokens?.accessToken || !tokens?.refreshToken) {
              throw new Error("INVALID_REISSUE_RESPONSE");
            }

            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);

            return tokens.accessToken;
          })
          .finally(() => {
            reissuing = null;
          });
      }

      const newAccessToken = await reissuing;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (reissueError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }

      return Promise.reject(reissueError);
    }
  },
);

export default apiClient;
