import apiClient from "./axios";

// 교수님 API 경로
// 목록: GET /api/professors, 상세: GET /api/professors/{professorId}
const API_URL = "/api/professors";

// 교수님 목록 캐시
let listCache = null;
// 교수님 상세 캐시
const detailCache = new Map();

// 백엔드 enum → 화면 표시값
const GRADE_MAP = { FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
// 백엔드 courseType enum 값과 맞춤 (목록에 없는 값은 그대로 표시)
const COURSE_TYPE_MAP = {
  MAJOR_FOUNDATION: "전공기초",
  MAJOR_CORE: "전공핵심",
  MAJOR_ADVANCED: "전공심화",
};

// API 응답 한 건을 화면에서 쓰는 형태로 변환 (값이 없으면 빈 값)
function toProfessor(d, fallbackId) {
  // 상세 응답의 labDetail은 객체 { labId, labName, labUrl, labDetail, labStudy }
  const lab = d.labDetail && typeof d.labDetail === "object" ? d.labDetail : null;

  return {
    id: d.professorId ?? fallbackId ?? "",
    name: d.professorName ?? "",
    office: d.professorRoom ?? "",
    phone: d.professorCall ?? "",
    email: d.professorEmail ?? "",
    photo: d.professorImageUrl ?? "",
    intro: d.professorDetail ?? "",
    lab: lab?.labName ?? "",
    labIntro: lab?.labDetail ?? "",
    labUrl: lab?.labUrl ?? "",
    fields: lab?.labStudy ?? [],
    courses: (d.courseList ?? []).map((c) => ({
      name: c.courseName ?? "",
      grade: GRADE_MAP[c.grade] ?? c.grade ?? "",
      type: COURSE_TYPE_MAP[c.courseType] ?? c.courseType ?? "",
    })),
  };
}

// 백엔드 실패 응답을 담는 에러
export class ApiError extends Error {
  constructor(message, code, status, errors = []) {
    super(message || "요청에 실패했습니다.");
    this.name = "ApiError";
    this.code = code; // 백엔드가 보낸 에러 코드
    this.status = status; // HTTP 상태 코드
    this.errors = errors; // 입력값 오류일 때
  }
}

// 실제로 백엔드 요청 보내기
async function getJson(url, signal) {
  let res;
  try {
    res = await apiClient.get(url, { signal });
  } catch (err) {
    // 요청 취소(화면 이동 등)는 그대로 던짐 → useFetch에서 무시
    if (!err.response) throw err;
    // 500 등 에러 상태 코드
    const body = err.response.data ?? {};
    throw new ApiError(body.message, body.code, err.response.status, body.errors ?? []);
  }

  const json = res.data;
  // 상태 코드는 200인데 success: false로 오는 경우도 실패로 처리
  if (json?.success === false) {
    throw new ApiError(json.message, json.code, res.status, json.errors ?? []);
  }
  return json && json.data !== undefined ? json.data : json;
}

// 캐시에 있으면 바로 꺼내 쓰기 위한 함수
// 저장된 목록 꺼내기
export const getCachedProfessors = () => listCache ?? undefined;
// 저장된 상세 정보 꺼내기
export const getCachedProfessor = (id) => detailCache.get(String(id));

// 목록 조회 함수
export async function fetchProfessors(signal) {
  if (listCache) return listCache;
  const list = await getJson(API_URL, signal);
  listCache = (list ?? []).map((d) => toProfessor(d));
  return listCache;
}
// 상세 조회 함수
export async function fetchProfessor(id, signal) {
  const key = String(id);
  if (detailCache.has(key)) return detailCache.get(key);

  const professor = toProfessor(await getJson(`${API_URL}/${encodeURIComponent(id)}`, signal), id);

  detailCache.set(key, professor);
  return professor;
}
