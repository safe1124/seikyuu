# Vite + React + TypeScript 웹 애플리케이션

이 프로젝트는 Vite, React, TypeScript를 기반으로 한 웹 애플리케이션입니다.

## 개발 시작 방법

1. 의존성 설치
   ```sh
   npm install
   ```
2. 개발 서버 실행
   ```sh
   npm run dev
   ```
3. 웹 브라우저에서 http://localhost:5173 접속

## 주요 스크립트
- `npm run dev` : 개발 서버 실행
- `npm run build` : 프로덕션 빌드
- `npm run preview` : 빌드 결과 미리보기

---

프로젝트 구조 및 추가 개발 방법은 Vite 공식 문서를 참고하세요.

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
