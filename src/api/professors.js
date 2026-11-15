import mockProfessors from "./mockProfessors";

// 교수님 API 주소 (실제 주소로 변경)
// 목록: GET API_URL, 상세: GET API_URL/{id}
const API_URL = "/api/professors";

// API 연결 전까지 예시 데이터로 화면 확인용. API 연결 후 false로 변경
const USE_MOCK = true;

// 한 번 받은 데이터는 새로고침 전까지 재사용 (목록 ↔ 상세 이동 시 다시 요청하지 않음)
// 실패한 요청은 저장하지 않으므로 다음에 다시 시도함
let listCache = null;
const detailCache = new Map();

// API 응답 한 건을 화면에서 쓰는 형태로 변환
// 응답 필드 이름이 다르면 오른쪽 값만 바꿔주면 됨 (예: d.professorName)
function toProfessor(d) {
  return {
    id: d.id ?? "",
    name: d.name ?? "",
    office: d.office ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    photo: d.photo ?? "", // 사진 URL이 없으면 기본 이미지 표시
    intro: d.intro ?? "",
    lab: d.lab ?? "",
    labIntro: d.labIntro ?? "",
    labUrl: d.labUrl ?? "", // 연구실 홈페이지 주소 (없으면 링크 아이콘 비활성화)
    fields: d.fields ?? [],
    courses: (d.courses ?? []).map((c) => ({
      name: c.name ?? "",
      grade: c.grade ?? "",
      type: c.type ?? "",
    })),
  };
}

// GET 요청 후 { data: ... }로 감싸져 오면 꺼내서 반환
// signal: 화면을 벗어나면 진행 중인 요청을 취소하기 위한 값
async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json && json.data !== undefined ? json.data : json;
}

// 캐시에 있으면 바로 꺼내 쓰기 위한 함수 (없으면 undefined)
export const getCachedProfessors = () => listCache ?? undefined;
export const getCachedProfessor = (id) => detailCache.get(String(id));

export async function fetchProfessors(signal) {
  if (listCache) return listCache;
  const list = USE_MOCK ? mockProfessors : await getJson(API_URL, signal);
  listCache = (list ?? []).map(toProfessor);
  return listCache;
}

export async function fetchProfessor(id, signal) {
  const key = String(id);
  if (detailCache.has(key)) return detailCache.get(key);

  let professor;
  if (USE_MOCK) {
    const found = mockProfessors.find((p) => String(p.id) === key);
    if (!found) throw new Error("교수님을 찾을 수 없습니다.");
    professor = toProfessor(found);
  } else {
    professor = toProfessor(await getJson(`${API_URL}/${encodeURIComponent(id)}`, signal));
  }

  detailCache.set(key, professor);
  return professor;
}
