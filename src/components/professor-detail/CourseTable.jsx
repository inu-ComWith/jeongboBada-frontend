import styles from "./CourseTable.module.css";

export default function CourseTable({ courses }) {
  return (
    <div className={styles.table}>
      <div className={styles.header}>
        <span className={styles.name}>담당과목</span>
        <span className={styles.grade}>학년</span>
        <span className={styles.type}>전공구분</span>
      </div>
      <ul className={styles.body}>
        {courses.length === 0 && <li className={styles.none}>담당과목이 없습니다.</li>}
        {courses.map((c, i) => (
          <li className={styles.row} key={`${c.name}-${i}`}>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.grade}>{c.grade}학년</span>
            <span className={styles.type}>
              <span className={styles.chip}>{c.type}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
