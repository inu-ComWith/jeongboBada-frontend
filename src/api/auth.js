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

export const sendPasswordResetCode = async ({ studentId, email }) => {
  const response = await apiClient.post("/api/auth/password-reset/send-code", {
    studentId,
    email,
  });

  return response.data;
};

export const verifyPasswordResetCode = async ({ studentId, code }) => {
  const response = await apiClient.post(
    "/api/auth/password-reset/verify-code",
    { studentId, code },
  );

  return response.data;
};

export const resetPassword = async ({ studentId, code, newPassword }) => {
  const response = await apiClient.post("/api/auth/password-reset", {
    studentId,
    code,
    newPassword,
  });

  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await apiClient.post("/api/auth/logout", {
    refreshToken,
  });

  return response.data;
};

export const resubmitVerification = async ({ studentId, file }) => {
  const formData = new FormData();

  formData.append("studentId", studentId.trim());
  formData.append("file", file);

  const response = await apiClient.post(
    "/api/auth/verification/resubmit",
    formData,
  );

  return response.data;
};
