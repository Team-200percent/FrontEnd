// 나중에 API로 받아오거나 별도 파일로 관리할 데이터
export const LEVELS = [
  {
    level: 1,
    title: "동네 초보",
    subtitle: "필수 행정 / 기본 생활 인프라를 파악해보세요",
    headerImage: "/icons/home/levelheader/level1.png",
    mission: {
      // ✅ level 1에 mission 객체 있음
      nextLevelName: "동네 적응자",
      completed: 10,
      total: 10,
    },
    stages: [
      {
        // 1
        type: "life",
        status: "completed",
        top: "17%",
        left: "12%",
        tooltipTop: "27%",
        tooltipAnchor: "8%",
        tooltipAnchorDirection: "top",

        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 2
        type: "stage",
        status: "completed",
        top: "17%",
        left: "41%",
        tooltipTop: "27%",
        tooltipAnchor: "41%",
        tooltipAnchorDirection: "top",
        missionDetail: {
          title: "동네 마트에서 장보기",
          xp: 10,
        },
      },
      {
        // 3
        type: "stage",
        status: "locked",
        top: "17%",
        left: "70%",
        tooltipTop: "27%",
        tooltipAnchor: "72%",
        tooltipAnchorDirection: "top",
        missionDetail: {
          title: "동네 카페에서 휴식",
          xp: 10,
        },
      },
      {
        // 4
        type: "stage",
        status: "locked",
        top: "32%",
        left: "88%",
        tooltipTop: "41%",
        tooltipAnchor: "92%",
        tooltipAnchorDirection: "top",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 5
        type: "stage",
        status: "locked",
        top: "49%",
        left: "70%",
        tooltipTop: "58%",
        tooltipAnchor: "72%",
        tooltipAnchorDirection: "top",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 6
        type: "stage",
        status: "locked",
        top: "49%",
        left: "41%",
        tooltipTop: "58%",
        tooltipAnchor: "41%",
        tooltipAnchorDirection: "top",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 7
        type: "stage",
        status: "locked",
        top: "65%",
        left: "12%",
        tooltipTop: "27%",
        tooltipAnchor: "9%",
        tooltipAnchorDirection: "bottom",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 8
        type: "stage",
        status: "locked",
        top: "82%",
        left: "30%",
        tooltipTop: "45%",
        tooltipAnchor: "28%",
        tooltipAnchorDirection: "bottom",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 9
        type: "stage",
        status: "locked",
        top: "82%",
        left: "59%",
        tooltipTop: "45%",
        tooltipAnchor: "59%",
        tooltipAnchorDirection: "bottom",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        // 10
        type: "stage",
        status: "locked",
        top: "82%",
        left: "88%",
        tooltipTop: "45%",
        tooltipAnchor: "91%",
        tooltipAnchorDirection: "bottom",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
    ],
  },
  {
    level: 2,
    title: "동네 적응자",
    subtitle: "생활 편의를 확장해보세요",
    headerImage: "/icons/home/levelheader/level2.png",
    mission: {
      // ✅ level 1에 mission 객체 있음
      nextLevelName: "동네 적응자",
      completed: 10,
      total: 10,
    },
    stages: [
      { type: "life", status: "completed", top: "17%", left: "12%" },
      { type: "stage", status: "completed", top: "17%", left: "41%" },
      { type: "stage", status: "locked", top: "17%", left: "70%" },
      { type: "stage", status: "locked", top: "32%", left: "88%" },
      { type: "stage", status: "locked", top: "49%", left: "70%" },
      { type: "stage", status: "locked", top: "49%", left: "41%" },
      { type: "stage", status: "locked", top: "65%", left: "12%" },
      { type: "stage", status: "locked", top: "82%", left: "30%" },
      { type: "stage", status: "locked", top: "82%", left: "59%" },
      { type: "stage", status: "locked", top: "82%", left: "88%" },
    ],
  },
  {
    level: 3,
    title: "동네 탐험가",
    subtitle: "다양한 상권과 문화시설을 경험해보세요",
    headerImage: "/icons/home/levelheader/level3.png",
    mission: {
      // ✅ level 1에 mission 객체 있음
      nextLevelName: "동네 적응자",
      completed: 10,
      total: 10,
    },
    stages: [
      { type: "life", status: "completed", top: "17%", left: "12%" },
      { type: "stage", status: "completed", top: "17%", left: "41%" },
      { type: "stage", status: "locked", top: "17%", left: "70%" },
      { type: "stage", status: "locked", top: "32%", left: "88%" },
      { type: "stage", status: "locked", top: "49%", left: "70%" },
      { type: "stage", status: "locked", top: "49%", left: "41%" },
      { type: "stage", status: "locked", top: "65%", left: "12%" },
      { type: "stage", status: "locked", top: "82%", left: "30%" },
      { type: "stage", status: "locked", top: "82%", left: "59%" },
      { type: "stage", status: "locked", top: "82%", left: "88%" },
    ],
  },
  {
    level: 4,
    title: "동네 단골",
    subtitle: "나만의 단골 가게를 찾아보세요",
    headerImage: "/icons/home/levelheader/level4.png",
    mission: {
      // ✅ level 1에 mission 객체 있음
      nextLevelName: "동네 적응자",
      completed: 4,
      total: 10,
    },
    stages: [
      { type: "life", status: "completed", top: "17%", left: "12%" },
      { type: "stage", status: "completed", top: "17%", left: "41%" },
      { type: "stage", status: "locked", top: "17%", left: "70%" },
      { type: "stage", status: "locked", top: "32%", left: "88%" },
      { type: "stage", status: "locked", top: "49%", left: "70%" },
      { type: "stage", status: "locked", top: "49%", left: "41%" },
      { type: "stage", status: "locked", top: "65%", left: "12%" },
      { type: "stage", status: "locked", top: "82%", left: "30%" },
      { type: "stage", status: "locked", top: "82%", left: "59%" },
      { type: "stage", status: "locked", top: "82%", left: "88%" },
    ],
  },
  {
    level: 5,
    title: "동네 고수",
    subtitle: "정착을 끝내고 토박이처럼 생활해보세요",
    headerImage: "/icons/home/levelheader/level5.png",
    mission: {
      // ✅ level 1에 mission 객체 있음
      nextLevelName: "동네 적응자",
      completed: 2,
      total: 10,
    },
    stages: [
      {
        type: "life",
        status: "completed",
        top: "17%",
        left: "12%",
        missionDetail: {
          title: "전입신고하러 주민센터 방문하기",
          xp: 20,
        },
      },
      {
        type: "stage",
        status: "completed",
        top: "17%",
        left: "41%",
        missionDetail: {
          title: "동네 마트에서 장보기",
          xp: 10,
        },
      },
      { type: "stage", status: "locked", top: "17%", left: "70%" },
      { type: "stage", status: "locked", top: "32%", left: "88%" },
      { type: "stage", status: "locked", top: "49%", left: "70%" },
      { type: "stage", status: "locked", top: "49%", left: "41%" },
      { type: "stage", status: "locked", top: "65%", left: "12%" },
      { type: "stage", status: "locked", top: "82%", left: "30%" },
      { type: "stage", status: "locked", top: "82%", left: "59%" },
      { type: "stage", status: "locked", top: "82%", left: "88%" },
    ],
  },
];
