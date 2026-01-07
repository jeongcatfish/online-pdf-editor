import type { Locale } from "./locale";

export const siteMeta = {
  ko: {
    title: "PDF Now - 온라인 PDF 편집기",
    description: "브라우저에서 바로 PDF 변환, 편집, 서명을 무료로 처리하세요."
  },
  en: {
    title: "PDF Now - Online PDF Editor",
    description: "Convert, edit, and sign PDFs in your browser for free."
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
      startFree: "무료로 시작하기"
    },
    hero: {
      badge: "온라인 PDF 도구",
      title: "온라인에서 간단하게 PDF 작업",
      subtitle: "PDF 병합, 서명, 변환을 브라우저에서 처리하세요.",
      chips: ["완전 무료", "설치 없음", "대용량 지원"]
    },
    upload: {
      emptyLabel: "PDF 파일을 놓으세요",
      hint: "클릭하거나 드래그 앤 드롭으로 업로드",
      button: "PDF 업로드하기"
    },
    quickCards: [
      { label: "페이지 병합", desc: "페이지 순서 변경 가능" },
      { label: "서명 추가", desc: "원하는 위치에 적용" },
      { label: "변환/추출", desc: "Word 변환, 이미지 추출" }
    ],
    toolsSection: {
      eyebrow: "주요 기능",
      title: "PDF를 위한 올인원 도구 세트",
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
      }
    ],
    usageSection: {
      eyebrow: "이용 방식",
      title: "전 기능 100% 무료",
      description:
        "모든 도구를 무료로 제공하며, 대용량/배치 작업도 추가 과금 없이 이용할 수 있습니다.",
      secondaryCta: "이용 안내",
      primaryCta: "무료로 시작하기",
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
      title: "세 단계로 끝나는 PDF 처리",
      steps: [
        { title: "업로드", description: "PDF 파일을 바로 끌어다 놓으세요." },
        { title: "편집", description: "필요한 도구를 선택해 즉시 편집합니다." },
        { title: "완료 및 다운로드", description: "완성된 파일을 안전하게 저장하세요." }
      ]
    },
    benefits: {
      eyebrow: "혜택",
      title: "PDF Now를 선택해야 하는 이유",
      description: "필요한 작업을 빠르게 처리하고, 보안과 사용성을 함께 제공합니다.",
      bullets: [
        "브라우저 기반으로 설치 없이 즉시 사용",
        "문서 버전 관리 제공",
        "자주 쓰는 작업을 빠르게 이어주는 템플릿 제공"
      ],
      primaryCta: "바로 시작",
      secondaryCta: "데모 보기"
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
      startFree: "Get started free"
    },
    hero: {
      badge: "Online PDF tools",
      title: "Do PDF work in minutes online",
      subtitle: "Merge, sign, and convert PDFs right in your browser.",
      chips: ["100% Free", "No Install", "Large Files OK"]
    },
    upload: {
      emptyLabel: "Drop a PDF file",
      hint: "Click or drag & drop to upload",
      button: "Upload PDF"
    },
    quickCards: [
      { label: "Merge pages", desc: "Reorder pages easily" },
      { label: "Add signatures", desc: "Place them anywhere you want" },
      { label: "Convert & extract", desc: "Convert to Word, extract images" }
    ],
    toolsSection: {
      eyebrow: "Key features",
      title: "An all-in-one toolkit for PDFs",
      description: "Merge pages and add signatures right in your browser."
    },
    features: [
      {
        title: "Merge pages",
        description: "Drag multiple documents to merge in one go."
      },
      {
        title: "Add signatures",
        description: "Place e-signatures and approve with one click."
      }
    ],
    usageSection: {
      eyebrow: "Pricing",
      title: "100% free for every tool",
      description: "All tools are free, and large or batch jobs stay free too.",
      secondaryCta: "Usage guide",
      primaryCta: "Get started free",
      cards: [
        {
          title: "All tools free",
          price: "$0",
          desc: "Editing, merging, signing, and more."
        },
        {
          title: "No per-task fees",
          price: "No extra cost",
          desc: "Large and batch jobs are still free."
        },
        {
          title: "No sign-up needed",
          price: "Always free",
          desc: "Start without billing or subscriptions."
        }
      ]
    },
    howSection: {
      eyebrow: "How it works",
      title: "PDF tasks in three steps",
      steps: [
        { title: "Upload", description: "Drop your PDF file right away." },
        { title: "Edit", description: "Pick the tools you need and edit instantly." },
        { title: "Finish & download", description: "Save the finished file safely." }
      ]
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Why choose PDF Now",
      description: "Get work done fast with security and usability built in.",
      bullets: [
        "Use instantly in the browser, no installs",
        "Version history and collaboration tracking",
        "Templates that speed up frequent tasks"
      ],
      primaryCta: "Start now",
      secondaryCta: "View demo"
    },
    workflow: {
      eyebrow: "Workflow",
      title: "Organize document work in one place",
      stats: [
        { label: "Upload wait time", value: "1.2s" },
        { label: "Avg edit time", value: "3 min" },
        { label: "Repeat usage", value: "94%" }
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description: "Get quick answers before you start with PDF Now.",
      items: [
        {
          question: "Is it really free?",
          answer: "Yes. No subscriptions, payments, or per-task charges."
        },
        {
          question: "Are my uploaded files safe?",
          answer: "We protect files with encrypted transfer and automatic deletion."
        },
        {
          question: "Can I use it on mobile?",
          answer: "The same editing experience on mobile and tablet."
        },
        {
          question: "Is team collaboration supported?",
          answer: "Share links and version history make collaboration easy."
        }
      ]
    },
    footer: {
      terms: "Terms of Service",
      privacy: "Privacy Policy"
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
      invalidFile: "PDF 파일만 업로드할 수 있습니다.",
      loadPdf: "PDF를 불러오지 못했습니다.",
      loadPdfRetry: "PDF를 불러오지 못했습니다. 다른 파일로 시도해주세요.",
      noMergePages: "병합할 페이지가 없습니다.",
      mergeFail: "병합 중 오류가 발생했습니다. 다시 시도해주세요.",
      signMissing: "PDF 업로드, 서명 작성, 위치 지정이 모두 필요합니다.",
      signFail: "서명 적용 중 오류가 발생했습니다."
    },
    merge: {
      emptyTotal: "PDF 파일을 추가하세요.",
      pickFiles: "파일 선택",
      pickHint: "페이지 순서는 아래에서 편집합니다.",
      addFiles: "파일 추가",
      dropTitle: "PDF를 놓아 병합하세요",
      dropHint: "여러 파일을 한 번에 드래그할 수 있어요.",
      emptyFiles: "추가된 파일이 없습니다.",
      pageOrder: "페이지 순서",
      pageOrderHint: "드래그로 페이지 순서를 변경하세요.",
      loadingPages: "페이지를 불러오는 중입니다...",
      emptyPages: "페이지가 없습니다. PDF를 추가해주세요.",
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
        removePage: "페이지 제거"
      }
    },
    sign: {
      uploadTitle: "PDF 업로드",
      uploadHint: "미리보기에서 서명 위치를 지정하세요.",
      selectPdf: "PDF 선택",
      emptyPdf: "PDF 파일을 선택해주세요.",
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
      undo: "서명 되돌리기",
      downloadSigned: "서명된 PDF 다운로드"
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
      hint: "Sign with mouse or touch.",
      clear: "Clear",
      previewAlt: "Signature preview",
      saved: "Saved signature"
    },
    errors: {
      invalidFile: "Only PDF files can be uploaded.",
      loadPdf: "Couldn't load the PDF.",
      loadPdfRetry: "Couldn't load the PDF. Try another file.",
      noMergePages: "No pages to merge.",
      mergeFail: "An error occurred while merging. Please try again.",
      signMissing: "Upload a PDF, create a signature, and choose a placement.",
      signFail: "An error occurred while applying the signature."
    },
    merge: {
      emptyTotal: "Add PDF files.",
      pickFiles: "Select files",
      pickHint: "Edit page order below.",
      addFiles: "Add files",
      dropTitle: "Drop PDFs to merge",
      dropHint: "You can drag multiple files at once.",
      emptyFiles: "No files added.",
      pageOrder: "Page order",
      pageOrderHint: "Drag to reorder pages.",
      loadingPages: "Loading pages...",
      emptyPages: "No pages yet. Add a PDF.",
      previewIdle: "Preview merge",
      previewLoading: "Generating preview...",
      downloadMerged: "Download merged PDF",
      previewTitle: "Merged preview",
      previewHint: "Scroll to review pages.",
      close: "Close",
      aria: {
        removeFile: "Remove file",
        moveUp: "Move up",
        moveDown: "Move down",
        removePage: "Remove page"
      }
    },
    sign: {
      uploadTitle: "Upload PDF",
      uploadHint: "Pick a signature position on the preview.",
      selectPdf: "Choose PDF",
      emptyPdf: "Please choose a PDF file.",
      pageSelect: "Select page",
      loadingPages: "Loading page info...",
      previewHint: "Click the preview to place your signature",
      emptyPreview: "Upload a PDF to see the preview.",
      stepsTitle: "Signature steps",
      stepsHint: "Follow the steps below.",
      steps: ["Upload PDF", "Create signature", "Click placement in preview"],
      createTitle: "Create signature",
      createHint: "Apply it to the PDF right away.",
      settingsTitle: "Signature settings",
      sizeLabel: "Size",
      positionLabel: "Placement",
      positionHint: "Click the PDF preview to set the signature position.",
      guidance: "Upload a PDF, create a signature, then click the preview.",
      applyIdle: "Apply signature",
      applyLoading: "Applying signature...",
      undo: "Undo signature",
      downloadSigned: "Download signed PDF"
    },
    header: {
      back: "Back home",
      title: "PDF Now Studio",
      subtitle: "Processed locally with no storage."
    },
    hero: {
      eyebrow: "PDF Utility",
      title: "Merge pages and add signatures right away",
      description: "Files stay in your browser and can be downloaded immediately after editing."
    },
    tools: {
      merge: { label: "Merge pages", description: "Combine multiple PDFs into one" },
      sign: { label: "Add signature", description: "Sign directly on the preview" }
    }
  }
} as const satisfies Record<Locale, unknown>;

export type EditorCopy = (typeof editorCopy)[Locale];
