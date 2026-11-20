import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProfessor, getCachedProfessor } from "../../api/professors";
import useFetch from "../../hooks/useFetch";
import { FileIcon, LinkIcon, UserIcon } from "../../components/common/Icons";
import LabLinkModal from "../../components/professor-detail/LabLinkModal";
import ProfileSidebar from "../../components/professor-detail/ProfileSidebar";
import InfoSection from "../../components/professor-detail/InfoSection";
import CourseTable from "../../components/professor-detail/CourseTable";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
// 공통 CSS 다음에 불러와야 .container 덮어쓰기 적용
import page from "./ProfessorPage.module.css";
import styles from "./ProfessorDetail.module.css";

export default function ProfessorDetail() {
  const { id } = useParams();
  const { data: professor, status } = useFetch(
    (signal) => fetchProfessor(id, signal),
    [id],
    () => getCachedProfessor(id),
  );
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const closeLabModal = useCallback(() => setIsLabModalOpen(false), []);

  useEffect(() => {
    if (!professor) return;
    const prevTitle = document.title;
    document.title = `${professor.name} 교수님 | 정보바다`;
    return () => {
      document.title = prevTitle;
    };
  }, [professor]);

  return (
    <>
      <Header />
      <main className={page.page}>
        <div className={styles.banner} />
        <div className={`${page.container} ${styles.container}`}>
          {status === "loading" && <p className={page.empty}>교수님 정보를 불러오는 중입니다...</p>}
          {status === "error" && <p className={page.empty}>교수님 정보를 불러오지 못했습니다.</p>}

          {status === "done" && (
            <div className={styles.body}>
              <ProfileSidebar professor={professor} />

              <div className={styles.content}>
                {/* 교수 소개 + 연구실 */}
                <div>
                  <InfoSection icon={<UserIcon />} title="교수 소개" text={professor.intro} />

                  <InfoSection
                    icon={<LinkIcon />}
                    dark
                    actionLabel="연구실 홈페이지로 이동"
                    onAction={professor.labUrl ? () => setIsLabModalOpen(true) : undefined}
                    title={professor.lab}
                    extra={professor.fields.map((f, i) => (
                      <span className={styles.tag} key={`${f}-${i}`}>
                        {f}
                      </span>
                    ))}
                    text={professor.labIntro}
                  />
                </div>

                {/* 담당과목 */}
                <div className={styles.courseCol}>
                  <InfoSection icon={<FileIcon />} title="담당과목">
                    <CourseTable courses={professor.courses} />
                  </InfoSection>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLabModalOpen && <LabLinkModal url={professor.labUrl} onClose={closeLabModal} />}
      </main>
      <Footer />
    </>
  );
}
