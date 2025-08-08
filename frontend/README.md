project/                    # 프로젝트 루트 디렉토리
│
├── public/                 # 정적 파일이 위치하는 폴더 (HTML, 이미지 등)
│   ├── fonts/				# React 애플리케이션의 시작 HTML 파일
│   │       ├── Pretendard-Regular.woff
│   │       └── Pretendard-Bold.woff
│   └── images/             # favicon(브라우저 구분), preview 모음
│   │       ├── logo.svg
│   │       └── preview.jpeg
│
├── src/                    # 주요 소스들 모음 폴더 (로직, 컴포넌트 등)
│   ├── apis/               # API 호출 로직을 모아놓는 폴더
│   │   ├── boothAPI.js
│   │   └── instance.js		# 기본 API 호출에 대한 로직을 작성하였다
│   │   
│   ├── assets/             # 프로젝트의 에셋 파일(이미지, 아이콘 등)을 모아놓는 폴더
│   │   ├── images/         # 이미지 파일 폴더
│   │   │   ├── leaf.png    # 잎에 떨어지는 효과를 위한 이미지
│   │   │   └── human.jpg  	# 개발자 페이지에 들어가는 이미지
│   │
│   ├── components/         # UI 컴포넌트들을 모아놓는 폴더
│   │   ├── Header.jsx      # 헤더 컴포넌트
│   │   ├── Footer.jsx      # 푸터 컴포넌트
│   │   └── Button.jsx      # 버튼 컴포넌트
│   │
│   ├── constants/          # 실제 API연결 전 더미 데이터 모음
│   │   ├── booth.js        # 헤더 컴포넌트
│   │   └── boothdetail.js  # 버튼 컴포넌트
│   │   
│   ├── hooks/              # 커스텀 훅스를 관리하는 폴더
│   │   ├── useBoothData.js     
│   │   └── useUserAuth.js      
│   │
│   ├── layout/             # 기본 레이아웃 설정
│   │   └── DefaultLayout.jsx 
│   │
│   ├── pages/              # 페이지별 컴포넌트를 정의하는 폴더
│   │   ├── Home.js         
│   │   ├── About.js            
│   │   └── Contact.js      
│   │
│   ├── styles/             # 전체 스타일 및 테마를 관리하는 폴더
│   │   ├── GlobalStyles.js       
│   │   ├── Theme.js               
│   │   └── fonts/             
│   │
│   ├── App.js              # 최상위 컴포넌트, 전체 애플리케이션의 구조를 정의
│   ├── index.js            # ReactDOM을 사용해 `App.js`를 렌더링
│   └── setupTests.js       # 테스트 환경 설정 파일
│
├── package.json            # 프로젝트의 메타데이터와 의존성 설정 파일
├── README.md               # 프로젝트 설명 파일
├── vite.config.js          # 기본 루트들을 새롭게 지정하는 파일
├── .github                 # github 기본 탬플릿들 정리 파일
└── .gitignore              # Git에 포함되지 않을 파일을 지정