// API 연결 전 화면 확인용 예시 데이터

const mockCourses = [
  { name: "자료구조", grade: 1, type: "전공심화" },
  { name: "컴퓨터네트워크", grade: 2, type: "전공심화" },
  { name: "운영체제", grade: 3, type: "전공필수" },
  { name: "정보보호", grade: 3, type: "전공심화" },
  { name: "캡스톤디자인", grade: 3, type: "전공심화" },
];

const mockProfessors = [
  "김태형", "이서연", "김정수하", "박민준", "최지우", "정하늘", "김헌",
  "윤도현", "한소희", "오세훈", "강예린", "임재현", "송유진",
].map((name, i) => ({
  id: i + 1,
  name,
  office: "7호관 211호",
  phone: "032-1234-1234",
  email: "professor@inu.ac.kr",
  intro: "들어가야할 내용을 여기에 적어둬",
  lab: "연구실 이름",
  labIntro: "들어가야할 내용을 여기에 적어둬",
  labUrl: "https://example.com",
  fields: ["연구 분야", "연구 분야"],
  courses: mockCourses,
}));

export default mockProfessors;
