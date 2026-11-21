import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProfessors, getCachedProfessors } from "../../api/professors";
import useFetch from "../../hooks/useFetch";
import ProfessorCard from "../../components/professor-list/ProfessorCard";
import ListNotice from "../../components/professor-list/ListNotice";
import ProfessorSearchBar from "../../components/professor-list/ProfessorSearchBar";
import { NoResultIcon } from "../../components/common/Icons";
import Header from "../../components/Header";
import page from "./ProfessorPage.module.css";
import styles from "./ProfessorList.module.css";

const MESSAGES = {
  loading: "교수님 정보를 불러오는 중입니다...",
  error: "교수님 정보를 불러오지 못했습니다.",
};

export default function ProfessorList() {
  const { data: professors, status } = useFetch(fetchProfessors, [], getCachedProfessors);

  // 검색어를 주소(?q=)에 저장해 뒤로 가기 시에도 유지
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") ?? "";
  const [input, setInput] = useState(keyword);

  const applyKeyword = (value) => {
    // 검색할 때마다 방문 기록이 쌓이지 않도록 replace
    setSearchParams(value ? { q: value } : {}, { replace: true });
  };

  // 목록이나 검색어가 바뀔 때만 다시 계산
  const filtered = useMemo(
    () => (professors ?? []).filter((p) => p.name.includes(keyword)),
    [professors, keyword],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    applyKeyword(input.trim());
  };

  // 입력값을 모두 지우면 전체 목록 표시
  const handleChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim() === "" && keyword) applyKeyword("");
  };

  const isEmpty = status === "done" && filtered.length === 0;
  const message = status !== "done" ? MESSAGES[status] : "";

  return (
    <>
      <Header />
      <main className={`${page.page} ${styles.listPage}`}>
        {/* 회색 영역 + 제목 */}
        <section className={styles.hero}>
          <div className={page.container}>
            <h1 className={styles.heroTitle}>교수님 정보</h1>
          </div>
        </section>

        <ProfessorSearchBar
          input={input}
          onInputChange={handleChange}
          onSubmit={handleSubmit}
        />

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
