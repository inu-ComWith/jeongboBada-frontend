import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Home from "../pages/dashboard/Home";
import About from "../pages/dashboard/About";
import Signup from "../pages/auth/Signup";
import Login from "../pages/auth/Login";
import ResetPw from "../pages/auth/ResetPw";
import VerificationResubmit from "../pages/auth/VerificationResubmit";
import ProfessorList from "../pages/professor/ProfessorList";
import ProfessorDetail from "../pages/professor/ProfessorDetail";
import AdminRoutes from "../pages/admin/AdminRoutes";
import ScrollManager from "../components/common/ScrollManager";
import Course from "../pages/course/Course";

import VerificationUITest from "../pages/auth/VerificationUITest";

function Layout() {
  return (
    <>
      <ScrollManager />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/password-reset", element: <ResetPw /> },
      { path: "/professor/list", element: <ProfessorList /> },
      { path: "/professor/:id", element: <ProfessorDetail /> },
      { path: "/admin/*", element: <AdminRoutes /> },
      { path: "/course", element: <Course /> },
      { path: "/verification/resubmit", element: <VerificationResubmit /> },
      { path: "/dev/verification", element: <VerificationUITest /> },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
