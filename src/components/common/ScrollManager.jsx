import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// 방문한 화면별 스크롤 위치 (location.key 기준)
const scrollPositions = new Map();

// 새 페이지로 이동하면 맨 위로, 뒤로/앞으로 가기면 이전 스크롤 위치로 복원
export default function ScrollManager() {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  // 브라우저 자동 복원은 화면이 그려지기 전에 동작해 어긋날 수 있어 직접 처리
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  // 화면이 그려진 직후, 페인트 전에 위치를 맞춰 깜빡임 방지
  useLayoutEffect(() => {
    const y = navigationType === "POP" ? (scrollPositions.get(key) ?? 0) : 0;
    window.scrollTo(0, y);
  }, [key, navigationType]);

  // 현재 화면의 스크롤 위치를 계속 기록
  useEffect(() => {
    const save = () => scrollPositions.set(key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [key]);

  return null;
}
