import { Routes, Route } from "react-router-dom";

import Home from "../pages/dashboard/Home";
import About from "../pages/dashboard/About";
import Signup from "../pages/auth/Signup";
import Login from "../pages/auth/Login";
import FindPw from "../pages/auth/FindPw";
import ProfessorList from "../pages/ProfessorList";
import ProfessorDetail from "../pages/ProfessorDetail";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/find-password" element={<FindPw />} />
      <Route path="/professor/list" element={<ProfessorList />} />
      <Route path="/professor/:id" element={<ProfessorDetail />} />
    </Routes>
  );
}

export default Router;
