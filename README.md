# 온라인 PDF 편집기

브라우저에서 PDF를 병합하고 서명을 추가하는 웹 앱입니다. Next.js(App Router)로 구성된 단일 프론트엔드이며 파일은 로컬에서만 처리됩니다.

## 어떻게 동작하나요
- 업로드한 PDF는 브라우저 메모리에서 처리됩니다.
- 미리보기/페이지 썸네일은 `pdfjs-dist`로 렌더링합니다.
- 병합/서명 적용은 `pdf-lib`으로 수행하고, 결과는 Blob으로 다운로드합니다.
- 서버 저장/전송 로직은 현재 구현에 없습니다.

## 시스템 아키텍처
- **UI 레이어**: `app/page.tsx`(랜딩), `app/editor/page.tsx`(병합/서명 도구)
- **상태 공유**: `app/providers.tsx`에서 업로드한 파일 목록을 컨텍스트로 공유
- **렌더링**: `pdfjs-dist` 워커(`/public/pdf.worker.min.mjs`)로 페이지를 캔버스에 그려 미리보기 제공
- **PDF 처리**: `pdf-lib`으로 페이지 복사/병합 및 서명 이미지 삽입

## 로컬 실행
```bash
npm install
npm run dev
```

## 폴더 구조 요약
- `app/`: 페이지와 레이아웃 (App Router)
- `components/`: UI 컴포넌트
- `lib/`: 유틸리티
- `public/`: 정적 에셋(워커 등)
