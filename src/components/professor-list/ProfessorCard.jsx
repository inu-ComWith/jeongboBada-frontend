import { memo } from "react";
import { Link } from "react-router-dom";
import { AvatarIcon, PhoneIcon, PinIcon } from "../common/Icons";
import styles from "./ProfessorCard.module.css";

// 검색어와 일치하는 부분을 굵게 표시
function Highlight({ text, keyword }) {
  const index = keyword ? text.indexOf(keyword) : -1;
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong>{keyword}</strong>
      {text.slice(index + keyword.length)}
    </>
  );
}

// 검색창에 입력할 때 목록 전체가 다시 그려지지 않도록 memo 처리
function ProfessorCard({ professor, keyword }) {
  const { id, name, office, phone, photo } = professor;

  return (
    <Link className={styles.card} to={`/professor/${encodeURIComponent(id)}`}>
      <div className={styles.photo}>
        {/* lazy: 화면에 보일 때만 사진을 불러옴 */}
        {photo ? (
          <img src={photo} alt={`${name} 교수님 사진`} loading="lazy" decoding="async" />
        ) : (
          <AvatarIcon />
        )}
      </div>
      <div className={styles.info}>
        <h2 className={styles.name}>
          <Highlight text={name} keyword={keyword} />
        </h2>
        <p className={styles.meta}>
          <PinIcon strokeWidth={2} />
          <span>{office}</span>
        </p>
        <p className={styles.meta}>
          <PhoneIcon strokeWidth={2} />
          <span>{phone}</span>
        </p>
      </div>
    </Link>
  );
}

export default memo(ProfessorCard);
