export const CODE_SECONDS = 5 * 60;
export const RESEND_SECONDS = 60;
export const MAX_ATTEMPTS = 5;

// TODO: 실제 카카오톡 오픈채팅 주소로 교체
export const SUPPORT_URL = "";

export const getError = (error) => ({
  code: error.response?.data?.code,
  message: error.response?.data?.message,
  fields: error.response?.data?.errors ?? [],
  headers: error.response?.headers,
});
