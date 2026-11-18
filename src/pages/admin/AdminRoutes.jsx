import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "../../components/admin/AdminRoute";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminVerifications from "./AdminVerifications";
import AdminVerificationDetail from "./AdminVerificationDetail";

// /admin/* 하위 라우트. AdminRoute가 GET /api/users/me 로 ADMIN 여부를 먼저 확인한다.
// 회원 관리(members)는 API 연결 전까지 라우트를 빼 두었다. 화면 코드는 AdminMembers.jsx에 남아 있다.
function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="verifications" replace />} />
          <Route path="verifications" element={<AdminVerifications />} />
          <Route
            path="verifications/:userId"
            element={<AdminVerificationDetail />}
          />
          <Route path="*" element={<Navigate to="verifications" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
