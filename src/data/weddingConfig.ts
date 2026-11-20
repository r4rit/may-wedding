export interface PersonInfo {
  firstName: string;
  lastName: string;
  englishName: string;
  relation: string;
  fatherName: string;
  fatherDeceased?: boolean;
  motherName: string;
  motherDeceased?: boolean;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface LocationInfo {
  venueName: string;
  hallName: string;
  address: string;
  jibunAddress?: string;
  lat: number;
  lng: number;
  naverPlaceId?: string;
  kakaoPlaceId?: string;
  transportation: {
    label: string;
    details: string[];
  }[];
}

export interface BankAccount {
  id: string;
  role: string;
  holder: string;
  bank: string;
  accountNumber: string;
}

export interface WeddingConfig {
  meta: {
    title: string;
    description: string;
    ogImage: string;
  };
  weddingDateISO: string;
  cover: {
    imageSrc: string;
    eyebrow: string;
    dateDisplay: string;
    venueDisplay: string;
  };
  groom: PersonInfo;
  bride: PersonInfo;
  greeting: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  timeline: TimelineItem[];
  gallery: GalleryImage[];
  location: LocationInfo;
  accounts: {
    notice: string;
    groomSide: BankAccount[];
    brideSide: BankAccount[];
  };
  footer: {
    message: string;
    copyright: string;
  };
}

// 예식 날짜(2027년 5월 22일 토요일)는 확정 반영되었으며,
// TODO: 예식 시간(14:00), 신랑·신부/양가 부모 성함, 예식장 주소/좌표, 계좌번호, 스냅 사진 경로를 실제 본식 정보로 교체하세요.
export const weddingConfig: WeddingConfig = {
  meta: {
    title: '민준 & 서연 결혼합니다',
    description: '2027년 5월 22일 토요일 오후 2시 · 예식장 이름',
    ogImage: '/og-image.jpg',
  },
  weddingDateISO: '2027-05-22T14:00:00+09:00',
  cover: {
    imageSrc: '/images/cover.webp',
    eyebrow: 'THE WEDDING OF',
    dateDisplay: '2027. 05. 22. SAT 2:00 PM',
    venueDisplay: '메종 드 아모르 · 3층 아모르홀',
  },
  groom: {
    lastName: '김',
    firstName: '민준',
    englishName: 'Minjun',
    relation: '장남',
    fatherName: '김철수',
    motherName: '이영희',
  },
  bride: {
    lastName: '박',
    firstName: '서연',
    englishName: 'Seoyeon',
    relation: '장녀',
    fatherName: '박영수',
    motherName: '최미영',
  },
  greeting: {
    eyebrow: 'INVITATION',
    title: '소중한 분들을 초대합니다',
    paragraphs: [
      '다정한 햇살이 머무는 오월,\n서로의 가장 좋은 친구가 되었던 두 사람이\n이제 평생을 함께 걸어가려 합니다.',
      '깊은 신뢰와 사랑으로 첫 발을 내딛는 자리에\n귀한 발걸음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.',
    ],
  },
  timeline: [
    {
      id: 'reception',
      time: '13:30',
      title: '웰컴 리셉션',
      location: '3층 아모르홀 로비',
      description: '신랑·신부 맞이 및 포토월 인사',
    },
    {
      id: 'ceremony',
      time: '14:00',
      title: '본식',
      location: '3층 아모르홀',
      description: '양가 화촉 점화 및 혼인 서약',
    },
    {
      id: 'banquet',
      time: '14:50',
      title: '연회장 식사',
      location: '2층 그랜드 다이닝',
      description: '식사 및 피로연 인사',
    },
  ],
  gallery: [
    { id: 'g1', src: '/images/gallery-01.webp', alt: '웨딩 스냅 사진 1' },
    { id: 'g2', src: '/images/gallery-02.webp', alt: '웨딩 스냅 사진 2' },
    { id: 'g3', src: '/images/gallery-03.webp', alt: '웨딩 스냅 사진 3' },
  ],
  location: {
    venueName: '메종 드 아모르',
    hallName: '3층 아모르홀',
    address: '서울특별시 강남구 테헤란로 000',
    jibunAddress: '서울특별시 강남구 역삼동 000-00',
    lat: 37.5006,
    lng: 127.0365,
    naverPlaceId: '',
    kakaoPlaceId: '',
    transportation: [
      {
        label: '지하철',
        details: ['2호선 역삼역 3번 출구 도보 5분'],
      },
      {
        label: '버스',
        details: ['간선 146, 341, 360 / 지선 3412 (역삼역 정류장 하차)'],
      },
      {
        label: '자가용 및 주차',
        details: ['건물 내 지하 주차장 2시간 무료 지원 (주차권 안내 데스크 배부)'],
      },
    ],
  },
  accounts: {
    notice: '참석이 어려우신 분들을 위해 감사한 마음으로 계좌번호를 기재하였습니다.',
    groomSide: [
      {
        id: 'g-1',
        role: '신랑',
        holder: '김민준',
        bank: '카카오뱅크',
        accountNumber: '3333-00-0000000',
      },
      {
        id: 'g-2',
        role: '신랑 아버지',
        holder: '김철수',
        bank: '국민은행',
        accountNumber: '000000-00-000000',
      },
    ],
    brideSide: [
      {
        id: 'b-1',
        role: '신부',
        holder: '박서연',
        bank: '신한은행',
        accountNumber: '110-000-000000',
      },
      {
        id: 'b-2',
        role: '신부 아버지',
        holder: '박영수',
        bank: '우리은행',
        accountNumber: '1002-000-000000',
      },
    ],
  },
  footer: {
    message: '늘 따뜻한 마음으로 축복해 주셔서 감사합니다.',
    copyright: 'MINJUN & SEOYEON · MAY 2027',
  },
};
