import { AvatarIcon, MailIcon, PhoneIcon, PinIcon, UserIcon } from "../common/Icons";
import icon from "./IconCircle.module.css";
import styles from "./ProfileSidebar.module.css";

function ContactRow({ icon: iconNode, strong, children }) {
  return (
    <li className={strong ? `${styles.contact} ${styles.strong}` : styles.contact}>
      <span className={icon.iconCircle}>{iconNode}</span>
      <span className={styles.text}>{children}</span>
    </li>
  );
}

// 상세 페이지 왼쪽: 사진 + 이름/장소/번호/메일 (스크롤해도 고정)
export default function ProfileSidebar({ professor }) {
  const { name, office, phone, email, photo } = professor;

  return (
    <aside className={styles.profile}>
      <div className={styles.photo}>
        {photo ? <img src={photo} alt={`${name} 교수님 사진`} /> : <AvatarIcon />}
      </div>
      <ul className={styles.contacts}>
        <ContactRow icon={<UserIcon />} strong>
          {name}
        </ContactRow>
        <ContactRow icon={<PinIcon />}>{office}</ContactRow>
        <ContactRow icon={<PhoneIcon />}>
          <a href={`tel:${phone}`}>{phone}</a>
        </ContactRow>
        <ContactRow icon={<MailIcon />}>
          <a href={`mailto:${email}`}>{email}</a>
        </ContactRow>
      </ul>
    </aside>
  );
}
