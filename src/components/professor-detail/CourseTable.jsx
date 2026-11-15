import "./CourseTable.css";

export default function CourseTable({ courses }) {
  return (
    <div className="course-table">
      <div className="course-table__header">
        <span className="course-table__name">담당과목</span>
        <span className="course-table__grade">학년</span>
        <span className="course-table__type">전공구분</span>
      </div>
      <ul className="course-table__body">
        {courses.length === 0 && <li className="course-table__none">담당과목이 없습니다.</li>}
        {courses.map((c, i) => (
          <li className="course-table__row" key={`${c.name}-${i}`}>
            <span className="course-table__name">{c.name}</span>
            <span className="course-table__grade">{c.grade}학년</span>
            <span className="course-table__type">
              <span className="chip">{c.type}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
