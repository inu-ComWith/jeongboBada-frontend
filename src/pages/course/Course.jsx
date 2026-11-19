import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Grid2X2, Globe2, Folder } from "lucide-react";

import Header from "../../components/Header";
import styles from "./Course.module.css";

// import bannerImg from "../../assets/이미지파일명.png";

const popularCourses = [
  {
    id: 1,
    name: "컴퓨터구조",
    professor: "조교수",
    credits: 3,
    type: "전공필수",
    Icon: Paperclip,
  },
  {
    id: 2,
    name: "알고리즘",
    professor: "안교수",
    credits: 3,
    type: "전공필수",
    Icon: Grid2X2,
  },
  {
    id: 3,
    name: "객체지향프로그래밍",
    professor: "김교수",
    credits: 3,
    type: "전공필수",
    Icon: Globe2,
  },
  {
    id: 4,
    name: "자료구조",
    professor: "이교수",
    credits: 3,
    type: "전공필수",
    Icon: Folder,
  },
];

const initialFilters = {
  grade: "",
  type: "",
  credits: "",
  professor: "",
};

export default function Course() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [activeService, setActiveService] = useState("course");

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchKeyword(keyword.trim());
  };

  const handleServiceClick = (service) => {
    if (service !== "course") return;
    setActiveService(service);
  };

  // API 연동 전 임시 검색 데이터
  const filteredCourses = popularCourses.filter((course) => {
    const query = searchKeyword.toLowerCase();

    const matchesKeyword =
      !query ||
      course.name.toLowerCase().includes(query) ||
      course.professor.toLowerCase().includes(query);

    const matchesType = !filters.type || course.type === filters.type;

    const matchesCredits =
      !filters.credits || course.credits === Number(filters.credits);

    const matchesProfessor =
      !filters.professor || course.professor === filters.professor;

    return matchesKeyword && matchesType && matchesCredits && matchesProfessor;
  });

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroDecoration} />

          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1>
                <div className={styles.heroH1}>
                  <span>쉽고 빠르게</span>
                  <strong> 전공생활 길잡이</strong>
                </div>
                <span>알아보기</span>
              </h1>

              <p>정보 바다에서 전공 정보를 만나보세요</p>

              <form className={styles.searchForm} onSubmit={handleSearch}>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="강의명, 교수명으로 검색"
                  aria-label="강의 검색"
                />

                <button type="submit">검색</button>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.courseSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <h2>더 나은 수강 선택을 위한 강의정보</h2>
              <p>강의명과 교수명으로 강의 정보를 찾아보세요</p>
            </div>

            <div className={styles.filterPanel}>
              <div className={styles.selectWrapper}>
                <select
                  aria-label="학년"
                  value={filters.grade}
                  onChange={(event) =>
                    handleFilterChange("grade", event.target.value)
                  }
                >
                  <option value="">학년 · 전체</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                  <option value="4">4학년</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  aria-label="전공 종류"
                  value={filters.type}
                  onChange={(event) =>
                    handleFilterChange("type", event.target.value)
                  }
                >
                  <option value="">전공 종류 · 전체</option>
                  <option value="전공필수">전공필수</option>
                  <option value="전공선택">전공선택</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  aria-label="학점"
                  value={filters.credits}
                  onChange={(event) =>
                    handleFilterChange("credits", event.target.value)
                  }
                >
                  <option value="">학점 · 전체</option>
                  <option value="1">1학점</option>
                  <option value="2">2학점</option>
                  <option value="3">3학점</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  aria-label="교수"
                  value={filters.professor}
                  onChange={(event) =>
                    handleFilterChange("professor", event.target.value)
                  }
                >
                  <option value="">교수 · 전체</option>
                  <option value="김교수">김교수</option>
                  <option value="이교수">이교수</option>
                </select>
              </div>
            </div>

            <div className={styles.serviceCards}>
              <button
                type="button"
                className={`${styles.serviceCard} ${
                  activeService === "course" ? styles.serviceCardActive : ""
                }`}
                onClick={() => handleServiceClick("course")}
              >
                <strong>강의 정보</strong>
                <span>전체 강의 조회</span>
              </button>

              <div
                className={`${styles.serviceCard} ${styles.disabledCard}`}
                aria-disabled="true"
              >
                <strong>시간표</strong>
                <span>2차 배포 · 준비 중</span>
              </div>

              <div
                className={`${styles.serviceCard} ${styles.disabledCard}`}
                aria-disabled="true"
              >
                <strong>졸업 관리</strong>
                <span>2차 배포 · 준비 중</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.popularSection}>
          <div className={styles.container}>
            <div className={styles.popularHeading}>
              <div className={styles.sectionHeading}>
                <h2>{searchKeyword ? "강의 검색 결과" : "인기 강의"}</h2>
                <p>
                  {searchKeyword
                    ? `"${searchKeyword}" 검색 결과입니다`
                    : "정보바다 사용자들이 추천하는 인기 정보를 찾아보세요"}
                </p>
              </div>

              <button
                type="button"
                className={styles.moreButton}
                onClick={() => navigate("/course/list")}
              >
                더보기 &gt;
              </button>
            </div>

            {filteredCourses.length > 0 ? (
              <div className={styles.popularGrid}>
                {filteredCourses.map((course) => {
                  const Icon = course.Icon;

                  return (
                    <article className={styles.popularCard} key={course.id}>
                      <div>
                        <h3>{course.name}</h3>
                        <p>
                          {course.professor} / {course.credits}학점 /{" "}
                          {course.type}
                        </p>
                      </div>

                      <Icon
                        className={styles.courseIcon}
                        size={26}
                        strokeWidth={1.8}
                      />
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                조건에 맞는 강의가 없습니다.
              </p>
            )}
          </div>
        </section>

        <section className={styles.banner}>
          {/* <section
            className={styles.banner}
            style={{ backgroundImage: `url(${bannerImg})` }}
          ></section> */}
          <div className={styles.bannerOverlay}>
            <div className={styles.container}>
              <div className={styles.bannerContent}>
                <span>정보바다</span>

                <h2>
                  정보바다는 학생들에게 필요한 정보를 한곳에 담아, 더 편리한
                  대학생활을 만들어갑니다
                </h2>

                <button type="button" onClick={() => navigate("/")}>
                  정보바다 소개 바로가기
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
