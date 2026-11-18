import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "../../components/admin/AdminRoute";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminMembers from "./AdminMembers";
import AdminVerifications from "./AdminVerifications";
import AdminVerificationDetail from "./AdminVerificationDetail";

// /admin/* 하위 라우트. AdminRoute가 GET /api/users/me 로 ADMIN 여부를 먼저 확인한다.
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
          <Route path="members" element={<AdminMembers />} />
          <Route path="*" element={<Navigate to="verifications" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
