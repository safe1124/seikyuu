# KogaPay - 家族間食べ物請求アプリ

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Technology](https://img.shields.io/badge/tech-Vite%2BReact%2BTypeScript-green.svg)

KogaPay는 가족 간 음식 구매 내역을 청구하고 승인/기각할 수 있는 모바일 특화 웹 애플리케이션입니다.

## 🎯 주요 기능

- **👶 청구인 (자녀) 기능**
  - 음식명과 가격 입력을 통한 청구서 생성
  - 청구 내역 확인 및 상태 추적
  
- **👨‍👩‍👧‍👦 피청구인 (부모) 기능**
  - 받은 청구서 승인/기각
  - 월별 필터를 통한 내역 관리
  
- **🔐 간편 로그인 시스템**
  - 로컬 스토리지 기반 사용자 관리
  - 이메일 기반 회원가입/로그인
  
- **🔗 6자리 개별코드 시스템**
  - 사용자별 고유 코드 자동 생성
  - 코드를 통한 가족 구성원 연결

## 🚀 개발 시작 방법

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저 접속**
   - http://localhost:5175 (포트는 자동 할당됨)

## 📱 사용 방법

### 1. 회원가입 및 로그인
- 새규 등록 또는 기존 이메일로 로그인
- 등록 시 6자리 개별코드 자동 생성

### 2. 가족 구성원 연결
- 상대방의 6자리 코드를 입력하여 연결
- 연결 후 청구/피청구 관계 성립

### 3. 역할 선택
- **청구인**: 음식 구매 내역 청구
- **피청구인**: 청구 내역 승인/기각

### 4. 청구서 관리
- 실시간 상태 확인 (대기중/승인됨/거절됨)
- 월별 필터를 통한 내역 관리

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Inline Styles (모바일 최적화)
- **Storage**: Local Storage
- **Language**: Japanese UI

## 📦 주요 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 🎨 UI/UX 특징

- **📱 모바일 최적화**: iPhone 세로 화면 기준 설계
- **🎌 일본어 인터페이스**: 모든 텍스트 일본어 표시
- **🎨 직관적 디자인**: 간단하고 명확한 사용자 인터페이스
- **⚡ 빠른 응답**: 로컬 스토리지 기반 즉시 반응

## 📁 프로젝트 구조

```
src/
├── App.tsx           # 메인 앱 컴포넌트
├── ChildPage.tsx     # 청구인 페이지
├── ParentPage.tsx    # 피청구인 페이지
├── types.ts          # TypeScript 타입 정의
├── userUtils.ts      # 사용자 관리 유틸리티
└── *.css            # 스타일 파일
```

## 🔧 개발 환경

- Node.js 18+
- npm 또는 yarn
- 모던 브라우저 (Chrome, Safari, Firefox 등)

---

**개발자**: GitHub Copilot  
**버전**: 1.0.0  
**최종 업데이트**: 2025년 6월

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
