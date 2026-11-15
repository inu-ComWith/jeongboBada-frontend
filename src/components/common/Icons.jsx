// 페이지에서 쓰는 아이콘 모음 (색은 currentColor를 따름)

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function AvatarIcon() {
  return (
    <svg viewBox="0 0 96 104" {...line} stroke="#aaa" strokeWidth="7">
      <circle cx="48" cy="30" r="20" />
      <path d="M6 100 C6 74 24 60 48 60 C72 60 90 74 90 100" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth="3">
      <circle cx="10.5" cy="10.5" r="6" />
      <line x1="15" y1="15" x2="20" y2="20" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7" />
    </svg>
  );
}

export function PinIcon({ strokeWidth = 1.6 }) {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth={strokeWidth}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function PhoneIcon({ strokeWidth = 1.6 }) {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth={strokeWidth}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth="1.6">
      <rect x="3" y="6" width="18" height="13" rx="1.5" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth="1.8">
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
    </svg>
  );
}

export function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" {...line} strokeWidth="1.6">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

// 검색 결과 없음 (돋보기 안에 X)
export function NoResultIcon() {
  return (
    <svg viewBox="0 0 48 48" {...line}>
      <circle cx="20" cy="20" r="14" strokeWidth="5" />
      <line x1="31" y1="31" x2="42" y2="42" strokeWidth="7" />
      <path d="M15 15l10 10M25 15l-10 10" strokeWidth="2" />
    </svg>
  );
}
