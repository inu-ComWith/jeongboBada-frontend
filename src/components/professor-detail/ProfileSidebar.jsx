import { AvatarIcon, MailIcon, PhoneIcon, PinIcon, UserIcon } from "../common/Icons";
import "./ProfileSidebar.css";

function ContactRow({ icon, strong, children }) {
  return (
    <li className={`contact${strong ? " contact--strong" : ""}`}>
      <span className="icon-circle">{icon}</span>
      <span className="contact__text">{children}</span>
    </li>
  );
}

// 상세 페이지 왼쪽: 사진 + 이름/장소/번호/메일 (스크롤해도 고정)
export default function ProfileSidebar({ professor }) {
  const { name, office, phone, email, photo } = professor;

  return (
    <aside className="profile">
      <div className="profile__photo">
        {photo ? <img src={photo} alt={`${name} 교수님 사진`} /> : <AvatarIcon />}
      </div>
      <ul className="profile__contacts">
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
