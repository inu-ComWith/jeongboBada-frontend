import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProfessors, getCachedProfessors } from "../../api/professors";
import useFetch from "../../hooks/useFetch";
import ProfessorCard from "../../components/professor-list/ProfessorCard";
import ListNotice from "../../components/professor-list/ListNotice";
import { NoResultIcon, SearchIcon } from "../../components/common/Icons";
import Header from "../../components/Header";
import page from "./ProfessorPage.module.css";
import styles from "./ProfessorList.module.css";

const MESSAGES = {
  loading: "교수님 정보를 불러오는 중입니다...",
  error: "교수님 정보를 불러오지 못했습니다.",
};

export default function ProfessorList() {
  const { data: professors, status } = useFetch(fetchProfessors, [], getCachedProfessors);

  // 검색어는 주소(?q=)에 저장 → 상세 페이지에 갔다가 뒤로 와도 검색 결과 유지
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") ?? "";
  const [input, setInput] = useState(keyword);

  const applyKeyword = (value) => {
    // replace: 검색할 때마다 방문 기록이 쌓이지 않도록
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  // 입력할 때마다 다시 거르지 않도록 목록이나 검색어가 바뀔 때만 계산
  const filtered = useMemo(
    () => (professors ?? []).filter((p) => p.name.includes(keyword)),
    [professors, keyword],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    applyKeyword(input.trim());
  };

  // 입력값을 모두 지우면 전체 목록으로 복귀
  const handleChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim() === "" && keyword) applyKeyword("");
  };

  const isEmpty = status === "done" && filtered.length === 0;
  const message = status !== "done" ? MESSAGES[status] : "";

  return (
    <>
      <Header />
      <main className={page.page}>
        <section className={styles.hero}>
          <div className={page.container}>
            <h1 className={styles.heroTitle}>교수님 정보</h1>
          </div>
        </section>

        {/* 검색바 띠만 스크롤 시 헤더 아래에 고정 (hero 밖에 두어야 hero가 지나가도 계속 고정됨) */}
        <div className={styles.searchBar}>
          <div className={page.container}>
            <form className={styles.search} role="search" onSubmit={handleSubmit}>
              <input
                type="text"
                className={styles.searchInput}
                aria-label="교수님 이름 검색"
                autoComplete="off"
                value={input}
                onChange={handleChange}
              />
              <button type="submit" className={styles.searchButton} aria-label="검색">
                <SearchIcon />
              </button>
            </form>
          </div>
        </div>

        <section className={styles.list}>
          <div className={page.container}>
            {filtered.length > 0 && (
              <ul className={styles.grid}>
                {filtered.map((p) => (
                  <li key={p.id}>
                    <ProfessorCard professor={p} keyword={keyword} />
                  </li>
                ))}
              </ul>
            )}
            {isEmpty ? (
              <div className={styles.noResult}>
                <span className={styles.noResultIcon} aria-hidden="true">
                  <NoResultIcon />
                </span>
                <p className={styles.noResultTitle}>검색하신 결과를 찾을 수 없어요</p>
                <p className={styles.noResultDesc}>
                  검색어를 다시 확인하거나
                  <br />
                  다른 키워드로 검색해 보세요.
                </p>
              </div>
            ) : (
              message && <p className={page.empty}>{message}</p>
            )}
          </div>
        </section>
      </main>
      <ListNotice />
    </>
  );
}
