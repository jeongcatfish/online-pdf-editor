import type { Locale } from "./locale";

export const siteMeta = {
  ko: {
    title: "PDF Now - 온라인 PDF 편집기",
    description: "브라우저에서 바로 PDF 변환, 편집, 서명을 무료로 처리하세요."
  },
  en: {
    title: "PDF Now - Online PDF Editor",
    description: "Edit, merge, and sign PDFs in your browser."
  }
} as const satisfies Record<Locale, { title: string; description: string }>;

export const homeCopy = {
  ko: {
    nav: {
      how: "작동 방식",
      usage: "이용 방식",
      tools: "도구",
      faq: "자주 묻는 질문"
    },
    cta: {
      startFree: "시작하기"
    },
    hero: {
      badge: "온라인 PDF 도구",
      title: "간단하게 온라인 PDF 작업",
      subtitle: "PDF 병합, 서명, 변환을 브라우저에서 처리하세요.",
      bookmarkHint: "이 페이지를 북마크하세요",
      chips: ["완전 무료", "설치 없음", "대용량 지원"]
    },
    upload: {
      emptyLabel: "파일을 놓으세요",
      hint: "클릭하거나 드래그 앤 드롭으로 업로드",
      button: "파일 업로드하기"
    },
    conversion: {
      eyebrow: "변환",
      title: "PDF를 Word로 변환",
      description: "PDF를 업로드하면 텍스트를 추출해 Word(.docx) 파일로 만들어 드려요.",
      dropLabelDefault: "변환할 PDF를 놓거나 클릭하세요",
      dropHint: "업로드된 PDF를 즉시 Word 문서로 만들어줍니다.",
      button: "Word로 변환",
      downloadLabel: "Word 다운로드",
      statusExtracting: "텍스트 추출 중...",
      statusPacking: "Word 문서 생성 중...",
      statusSuccess: "변환 준비 완료",
      statusError: "변환 실패. 다시 시도해주세요.",
      invalidFile: "PDF 파일만 업로드할 수 있습니다.",
      pageLabel: "페이지",
      emptyPageLabel: "텍스트를 찾을 수 없습니다."
    },
    quickCards: [
      { label: "페이지 병합", desc: "페이지 순서 변경 가능" },
      { label: "서명 추가", desc: "원하는 위치에 적용" },
      { label: "변환/추출", desc: "Word 변환, 이미지 추출" }
    ],
    toolsSection: {
      eyebrow: "주요 기능",
      title: "PDF를 위한 도구 세트",
      description: "페이지 병합과 서명을 브라우저에서 바로 처리하세요."
    },
    features: [
      {
        title: "페이지 병합",
        description: "여러 문서를 한 번에 드래그해 병합하세요."
      },
      {
        title: "서명 추가",
        description: "서명을 작성하고 클릭 한 번으로 문서에 추가하세요."
      },
      {
        title: "Word 변환",
        description: "PDF를 업로드하면 즉시 Word(.docx)로 재구성합니다.",
        ctaLabel: "Word로 변환",
        ctaHref: "/convert"
      }
    ],
    usageSection: {
      eyebrow: "이용 방식",
      title: "전 기능 100% 무료",
      description:
        "모든 도구를 무료로 제공하며, 대용량/배치 작업도 추가 과금 없이 이용할 수 있습니다.",
      primaryCta: "시작하기",
      cards: [
        {
          title: "전 기능 무료",
          price: "₩0",
          desc: "편집, 병합, 서명 등 모든 도구 제공"
        },
        {
          title: "작업당 과금 없음",
          price: "추가 비용 0",
          desc: "대용량/배치 작업도 무료 사용"
        },
        {
          title: "가입·구독 없음",
          price: "항상 무료",
          desc: "결제 없이 바로 사용 가능"
        }
      ]
    },
    howSection: {
      eyebrow: "작동 방식",
      title: "세 단계로 끝나는 처리",
      steps: [
        { title: "업로드", description: "PDF 파일을 바로 끌어다 놓으세요." },
        { title: "편집", description: "필요한 도구를 선택해 즉시 편집합니다." },
        { title: "완료 및 다운로드", description: "완성된 파일을 안전하게 저장하세요." }
      ]
    },
    benefits: {
      eyebrow: "혜택",
      title: "PDF Now 선택해야 하는 이유",
      description: "필요한 작업을 빠르게 처리하고, 보안과 사용성을 함께 제공합니다.",
      bullets: [
        "브라우저 기반으로 설치 없이 즉시 사용",
        "문서 버전 관리 제공",
        "자주 쓰는 작업을 빠르게 이어주는 템플릿 제공"
      ],
      primaryCta: "바로 시작"
    },
    workflow: {
      eyebrow: "작업 흐름",
      title: "문서 작업을 간단하게 정리합니다",
      stats: [
        { label: "업로드 대기 시간", value: "1.2s" },
        { label: "평균 편집 완료", value: "3분" },
        { label: "반복 사용률", value: "94%" }
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "자주 묻는 질문",
      description: "PDF Now 사용 전 궁금한 점을 빠르게 확인하세요.",
      items: [
        {
          question: "정말 무료인가요?",
          answer: "네. 구독/결제/작업당 과금 없이 모든 기능을 무료로 제공합니다."
        },
        {
          question: "업로드한 파일은 안전한가요?",
          answer: "전송 구간 암호화와 자동 삭제 정책으로 파일을 안전하게 보호합니다."
        },
        {
          question: "모바일에서도 이용할 수 있나요?",
          answer: "모바일과 태블릿에서도 동일한 편집 경험을 제공합니다."
        },
        {
          question: "팀 협업이 가능한가요?",
          answer: "공유 링크와 버전 히스토리를 통해 팀원과 협업할 수 있습니다."
        }
      ]
    },
    footer: {
      terms: "서비스 약관",
      privacy: "개인정보처리방침"
    }
  },
  en: {
    nav: {
      how: "How it works",
      usage: "Pricing",
      tools: "Tools",
      faq: "FAQ"
    },
    cta: {
      startFree: "Start"
    },
    hero: {
      badge: "PDF tools",
      title: "Edit PDFs online fast",
      subtitle: "Merge, sign, and convert in your browser.",
      bookmarkHint: "Bookmark this page",
      chips: ["Free", "No install", "Large files"]
    },
    upload: {
      emptyLabel: "Drop files",
      hint: "Click or drag to upload",
      button: "Upload files"
    },
    conversion: {
      eyebrow: "Convert",
      title: "PDF to Word",
      description: "Upload a PDF and we’ll turn extracted text into a downloadable .docx.",
      dropLabelDefault: "Drop a PDF or click to select",
      dropHint: "Uploaded PDFs are immediately packaged into Word.",
      button: "Convert to Word",
      downloadLabel: "Download Word",
      statusExtracting: "Extracting text...",
      statusPacking: "Creating Word file...",
      statusSuccess: "Ready to download",
      statusError: "Conversion failed. Try again.",
      invalidFile: "Please upload a PDF.",
      pageLabel: "Page",
      emptyPageLabel: "No text detected."
    },
    quickCards: [
      { label: "Merge pages", desc: "Reorder pages" },
      { label: "Add signature", desc: "Place anywhere" },
      { label: "Convert/extract", desc: "Word + images" }
    ],
    toolsSection: {
      eyebrow: "Features",
      title: "All-in-one PDF tools",
      description: "Merge pages and sign in-browser."
    },
    features: [
      {
        title: "Merge pages",
        description: "Drag docs to merge."
      },
      {
        title: "Add signatures",
        description: "Add e-signatures fast."
      },
      {
        title: "PDF to Word",
        description: "Upload a PDF and get the extracted text in a Word (.docx) file.",
        ctaLabel: "Convert to Word",
        ctaHref: "/convert"
      }
    ],
    usageSection: {
      eyebrow: "Pricing",
      title: "All tools free",
      description: "All tools are free, even large or batch jobs.",
      primaryCta: "Start",
      cards: [
        {
          title: "All tools free",
          price: "$0",
          desc: "Edit, merge, sign, more."
        },
        {
          title: "No task fees",
          price: "No extra cost",
          desc: "Large and batch jobs free."
        },
        {
          title: "No signup",
          price: "Always free",
          desc: "No billing or subs."
        }
      ]
    },
    howSection: {
      eyebrow: "How it works",
      title: "PDF in 3 steps",
      steps: [
        { title: "Upload", description: "Drop your PDF." },
        { title: "Edit", description: "Pick tools and edit." },
        { title: "Finish & download", description: "Download safely." }
      ]
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Why PDF Now",
      description: "Fast work with built-in security.",
      bullets: [
        "Use in-browser, no install",
        "Version history + collab",
        "Templates for common tasks"
      ],
      primaryCta: "Start"
    },
    workflow: {
      eyebrow: "Workflow",
      title: "One place for document work",
      stats: [
        { label: "Upload wait", value: "1.2s" },
        { label: "Avg edit", value: "3 min" },
        { label: "Repeat use", value: "94%" }
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions",
      description: "Quick answers before you start.",
      items: [
        {
          question: "Really free?",
          answer: "Yes. No subs, payments, or per-task fees."
        },
        {
          question: "Are uploads safe?",
          answer: "Encrypted transfer and auto delete."
        },
        {
          question: "Works on mobile?",
          answer: "Same on mobile and tablet."
        },
        {
          question: "Team collaboration?",
          answer: "Share links + history for teams."
        }
      ]
    },
    footer: {
      terms: "Terms",
      privacy: "Privacy"
    }
  }
} as const satisfies Record<Locale, unknown>;

export type HomeCopy = (typeof homeCopy)[Locale];

export const editorCopy = {
  ko: {
    signaturePad: {
      hint: "마우스/터치로 서명하세요.",
      clear: "지우기",
      previewAlt: "서명 미리보기",
      saved: "저장된 서명"
    },
    errors: {
      invalidFile: "PDF, JPG, PNG만 업로드할 수 있습니다.",
      loadPdf: "PDF를 불러오지 못했습니다.",
      loadPdfRetry: "PDF를 불러오지 못했습니다. 다른 파일로 시도해주세요.",
      noMergePages: "병합할 페이지가 없습니다.",
      mergeFail: "병합 중 오류가 발생했습니다. 다시 시도해주세요.",
      signMissing: "PDF 업로드 후 서명 또는 텍스트를 추가하세요.",
      signFail: "서명 적용 중 오류가 발생했습니다."
    },
    unsupportedFile: {
      title: "지원되지 않는 형식",
      description: "PDF/JPG/PNG로 내보낸 뒤 다시 업로드해주세요.",
      supportedFormats: "지원 형식: PDF · JPG · PNG",
      action: "알겠습니다"
    },
    merge: {
      emptyTotal: "PDF 파일을 추가하세요.",
      pickFiles: "파일 선택",
      pickHint: "페이지 순서는 아래에서 편집합니다.",
      addFiles: "파일 추가",
      dropTitle: "파일을 놓아 병합하세요",
      dropHint: "여러 문서를 한 번에 드래그할 수 있어요.",
      emptyFiles: "추가된 파일이 없습니다.",
      pageOrder: "페이지 순서",
      pageOrderHint: "드래그로 페이지 순서를 변경하세요.",
      loadingPages: "페이지를 불러오는 중입니다...",
      emptyPages: "페이지가 없습니다. PDF를 추가해주세요.",
      pagePreviewTitle: "페이지 미리보기",
      previewIdle: "병합 후 미리보기",
      previewLoading: "미리보기 생성 중...",
      downloadMerged: "병합 파일 다운로드",
      previewTitle: "병합 미리보기",
      previewHint: "스크롤로 페이지를 확인하세요.",
      close: "닫기",
      aria: {
        removeFile: "파일 제거",
        moveUp: "위로 이동",
        moveDown: "아래로 이동",
        removePage: "페이지 제거",
        previewPage: "페이지 미리보기"
      }
    },
    sign: {
      uploadTitle: "PDF 업로드",
      uploadHint: "미리보기에서 서명 위치를 지정하세요.",
      selectPdf: "파일 선택",
      emptyPdf: "파일을 선택해주세요.",
      pageSelect: "페이지 선택",
      loadingPages: "페이지 정보를 불러오는 중...",
      previewHint: "미리보기에서 서명 위치를 클릭하세요",
      emptyPreview: "PDF를 업로드하면 미리보기가 표시됩니다.",
      stepsTitle: "서명 진행 단계",
      stepsHint: "아래 순서대로 진행하면 됩니다.",
      steps: ["PDF 업로드", "서명 만들기", "미리보기에서 위치 클릭"],
      createTitle: "서명 만들기",
      createHint: "서명 후 바로 PDF에 적용할 수 있어요.",
      settingsTitle: "서명 설정",
      sizeLabel: "크기",
      positionLabel: "위치",
      positionHint: "PDF 미리보기를 클릭해 서명 위치를 지정하세요.",
      guidance: "PDF 업로드 → 서명 작성 → 미리보기 클릭 순서로 진행하세요.",
      applyIdle: "서명 적용",
      applyLoading: "서명 적용 중...",
      undo: "되돌리기",
      downloadSigned: "편집된 PDF 다운로드",
      textToolbar: "텍스트 추가",
      textSettingsTitle: "텍스트 설정",
      textSettingsHint: "선택한 텍스트 스타일을 조절하세요.",
      textFontLabel: "폰트",
      textSizeLabel: "크기",
      textColorLabel: "색상",
      textAlignLabel: "정렬",
      textAlignLeft: "좌",
      textAlignCenter: "중앙",
      textAlignRight: "우",
      signatureToolbar: "서명 위치",
      textMoveAria: "텍스트 이동",
      textHideAria: "텍스트 안내 숨기기",
      textDeleteAria: "텍스트 삭제",
      textSelectHint: "텍스트 박스를 선택해 스타일을 변경하세요.",
      textPlaceholder: "텍스트"
    },
    header: {
      back: "홈으로",
      title: "PDF Now 편집 스튜디오",
      subtitle: "저장 없이 로컬에서 처리됩니다."
    },
    hero: {
      eyebrow: "PDF 유틸리티",
      title: "페이지 병합과 서명 추가를 지금 바로 처리하세요",
      description: "파일은 브라우저에서만 처리되며, 편집 후 즉시 다운로드할 수 있습니다."
    },
    tools: {
      merge: { label: "페이지 병합", description: "여러 PDF를 한 파일로" },
      sign: { label: "서명 추가", description: "미리보기에서 바로 서명" }
    }
  },
  en: {
    signaturePad: {
      hint: "Sign with mouse/touch.",
      clear: "Clear",
      previewAlt: "Signature preview",
      saved: "Saved"
    },
    errors: {
      invalidFile: "Only PDF, JPG, PNG files are supported.",
      loadPdf: "Couldn't load PDF.",
      loadPdfRetry: "Couldn't load PDF. Try another.",
      noMergePages: "No pages to merge.",
      mergeFail: "Merge failed. Try again.",
      signMissing: "Upload a PDF and add a signature or text.",
      signFail: "Signature failed. Try again."
    },
    unsupportedFile: {
      title: "Unsupported format",
      description: "Export it as PDF/JPG/PNG and upload again.",
      supportedFormats: "Supported: PDF · JPG · PNG",
      action: "Got it"
    },
    merge: {
      emptyTotal: "Add PDFs.",
      pickFiles: "Select files",
      pickHint: "Edit order below.",
      addFiles: "Add files",
      dropTitle: "Drop files to merge",
      dropHint: "Drag multiple documents.",
      emptyFiles: "No files yet.",
      pageOrder: "Page order",
      pageOrderHint: "Drag to reorder.",
      loadingPages: "Loading pages...",
      emptyPages: "No pages. Add a PDF.",
      pagePreviewTitle: "Page preview",
      previewIdle: "Preview",
      previewLoading: "Generating...",
      downloadMerged: "Download merged",
      previewTitle: "Preview",
      previewHint: "Scroll to review.",
      close: "Close",
      aria: {
        removeFile: "Remove file",
        moveUp: "Move up",
        moveDown: "Move down",
        removePage: "Remove page",
        previewPage: "Preview page"
      }
    },
    sign: {
      uploadTitle: "Upload PDF",
      uploadHint: "Pick a spot on the preview.",
      selectPdf: "Choose file",
      emptyPdf: "Choose a file.",
      pageSelect: "Select page",
      loadingPages: "Loading pages...",
      previewHint: "Click preview to place signature",
      emptyPreview: "Upload a PDF to preview.",
      stepsTitle: "Steps",
      stepsHint: "Follow the steps.",
      steps: ["Upload PDF", "Create signature", "Click preview"],
      createTitle: "Create signature",
      createHint: "Apply it right away.",
      settingsTitle: "Settings",
      sizeLabel: "Size",
      positionLabel: "Position",
      positionHint: "Click preview to set position.",
      guidance: "Upload, sign, then click preview.",
      applyIdle: "Apply signature",
      applyLoading: "Applying signature...",
      undo: "Undo",
      downloadSigned: "Download edited PDF",
      textToolbar: "Add text",
      textSettingsTitle: "Text settings",
      textSettingsHint: "Adjust styles for the selected text box.",
      textFontLabel: "Font",
      textSizeLabel: "Size",
      textColorLabel: "Color",
      textAlignLabel: "Align",
      textAlignLeft: "Left",
      textAlignCenter: "Center",
      textAlignRight: "Right",
      signatureToolbar: "Place signature",
      textMoveAria: "Move text",
      textHideAria: "Hide text guides",
      textDeleteAria: "Delete text",
      textSelectHint: "Select a text box to edit its style.",
      textPlaceholder: "Text"
    },
    header: {
      back: "Back",
      title: "PDF Now Studio",
      subtitle: "Local processing, no storage."
    },
    hero: {
      eyebrow: "PDF Tools",
      title: "Merge pages, add signatures",
      description: "Files stay in-browser and download instantly."
    },
    tools: {
      merge: { label: "Merge pages", description: "Combine PDFs" },
      sign: { label: "Add signature", description: "Sign on preview" }
    }
  }
} as const satisfies Record<Locale, unknown>;

export type EditorCopy = (typeof editorCopy)[Locale];
