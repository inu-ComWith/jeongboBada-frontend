import apiClient from "./axios";

export const signup = async (formData) => {
  const response = await apiClient.post("/api/auth/signup", formData);

  return response.data;
};

export const checkNickname = async (nickname) => {
  const response = await apiClient.get("/api/auth/check-nickname", {
    params: {
      nickname,
    },
  });

  return response.data;
};

export const login = async ({ studentId, password }) => {
  const response = await apiClient.post("/api/auth/login", {
    studentId,
    password,
  });

  return response.data;
};

// 아직 사용하는 곳 없음 나중에 interceptor에서 사용
export const reissue = async (refreshToken) => {
  const response = await apiClient.post("/api/auth/reissue", {
    refreshToken,
  });

  return response.data;
};
