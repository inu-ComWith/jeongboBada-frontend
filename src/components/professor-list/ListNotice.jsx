import { useId } from "react";
import logoImg from "../../assets/logo.png";
import styles from "./ListNotice.module.css";

// 시안에서 잰 물결 곡선 (viewBox 2252 x 435 기준)
// 뒤 물결: 왼쪽 위 → 가운데 아래로 꺼짐 → 오른쪽에서 다시 솟음
const BACK_WAVE =
  "M0 2 C25 8 100 27 150 38 C200 49 250 59 300 68 C350 77 400 85 450 91 C500 97 550 102 600 106 C650 110 700 112 750 112 C800 112 850 111 900 109 C950 107 1000 105 1050 102 C1100 99 1150 95 1200 90 C1250 85 1300 80 1350 74 C1400 68 1450 61 1500 53 C1550 45 1600 35 1650 28 C1700 21 1750 14 1800 9 C1850 4 1900 2 1950 1 C2000 0 2050 1 2100 4 C2150 7 2227 15 2252 17 V435 H0 Z";
// 앞 물결: 왼쪽 아래 → 가운데에서 솟음 → 오른쪽에서 꺼졌다가 끝에서 올라감
const FRONT_WAVE =
  "M0 145 C25 141 100 129 150 123 C200 117 250 112 300 107 C350 102 400 98 450 94 C500 90 550 88 600 85 C650 82 700 80 750 79 C800 78 850 77 900 77 C950 77 1000 78 1050 80 C1100 82 1150 85 1200 89 C1250 93 1300 98 1350 103 C1400 108 1450 112 1500 117 C1550 122 1600 126 1650 130 C1700 134 1750 137 1800 138 C1850 139 1900 140 1950 138 C2000 136 2050 132 2100 124 C2150 116 2227 93 2252 87 V435 H0 Z";

// 교수님 목록 페이지 푸터: 로고 + 안내 문구 + 물결 배경 (공통 Footer 대신 사용)
export default function ListNotice() {
  // useId 값의 콜론 등 특수문자는 url(#id)에서 문제될 수 있어 제거
  const clipId = `wave-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <footer className={styles.notice}>
      <img src={logoImg} alt="" className={styles.logo} />
      <p className={styles.text}>
        {/* 좁은 화면에서 <br>을 숨기면 줄이 붙지 않도록 공백({" "})을 함께 둠 */}
        본 페이지의 교수진 정보는 학과에서 제공한 자료를 기준으로 작성되었으며,{" "}
        <br />
        소속 및 연락처는 변경될 수 있습니다. 최신 정보는 학과 공식 홈페이지를 통해{" "}
        <br />
        확인하시기 바랍니다.
      </p>

      <svg
        className={styles.wave}
        viewBox="0 0 2252 435"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={BACK_WAVE} />
          </clipPath>
        </defs>
        {/* 시안 색: 뒤 물결만 #f4f4f4 / 앞 물결만 #ececec / 두 물결이 겹친 곳 #e7e7e7 */}
        <path d={BACK_WAVE} fill="#f4f4f4" />
        <path d={FRONT_WAVE} fill="#ececec" />
        <path d={FRONT_WAVE} fill="#e7e7e7" clipPath={`url(#${clipId})`} />
      </svg>
    </footer>
  );
}
