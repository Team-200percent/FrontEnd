// 나중에 API로 받아오거나 별도 파일로 관리할 데이터
export const LEVELS = [
  {
    level: 1,
    title: "동네 초보",
    subtitle: "필수 행정 / 기본 생활 인프라를 파악해보세요",
    stages: [
      { type: "life", status: "completed", top: "10%", left: "15%" },
      { type: "stage", status: "completed", top: "23%", left: "48%" },
      { type: "stage", status: "locked", top: "15%", left: "80%" },
      { type: "milestone", status: "locked", top: "35%", left: "20%" },
      { type: "stage", status: "locked", top: "45%", left: "50%" },
      { type: "stage", status: "locked", top: "38%", left: "80%" },
      { type: "stage", status: "locked", top: "60%", left: "15%" },
      { type: "milestone", status: "locked", top: "65%", left: "85%" },
      { type: "stage", status: "locked", top: "80%", left: "20%" },
      { type: "stage", status: "locked", top: "82%", left: "52%" },
      { type: "stage", status: "locked", top: "80%", left: "85%" },
    ],
  },
  {
    level: 2,
    title: "생활 적응자",
    subtitle: "생활 편의를 확장해보세요",
    stages: [
      // 레벨 2 스테이지 데이터...
    ],
  },
];
