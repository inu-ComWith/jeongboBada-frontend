import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "../common/Icons";
import page from "../../pages/professor/ProfessorPage.module.css";
import styles from "./ProfessorSearchBar.module.css";

// 교수님 목록 검색바: 스크롤 시 헤더 아래에 고정되며 흰색 바로 바뀜
export default function ProfessorSearchBar({ input, onInputChange, onSubmit, count }) {
  const barRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  // 검색바가 헤더 아래에 닿았는지 확인
  useEffect(() => {
    const bar = barRef.current;
    let stickyTop = 0;
    let frame = 0;

    // 고정 위치는 CSS의 top 값 사용
    const measure = () => {
      stickyTop = parseFloat(getComputedStyle(bar).top) || 0;
    };
    const check = () => {
      frame = 0;
      setIsStuck(bar.getBoundingClientRect().top <= stickyTop + 0.5);
    };
    // 프레임당 한 번만 확인
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={barRef} className={`${styles.searchBar} ${isStuck ? styles.stuck : ""}`}>
      <div className={`${page.container} ${styles.inner}`}>
        <form className={styles.search} role="search" onSubmit={onSubmit}>
          <input
            type="text"
            className={styles.searchInput}
            aria-label="교수님 이름 검색"
            placeholder={isStuck ? "교수님 이름으로 검색" : undefined}
            autoComplete="off"
            value={input}
            onChange={onInputChange}
          />
          <button type="submit" className={styles.searchButton} aria-label="검색">
            <SearchIcon />
          </button>
        </form>

        {count != null && (
          <p className={styles.count}>
            교수님 <strong>{count}</strong>명
          </p>
        )}
      </div>
    </div>
  );
}
