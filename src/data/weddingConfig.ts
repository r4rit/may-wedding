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

// 예식 일정(2027년 5월 22일 토요일 12:10), 성함, 원주 빌라드아모르 위치, 웨딩 스냅 15장이 반영되어 있습니다.
// TODO: 실제 은행 계좌번호와 네이버 지도 연동 시 건물 핀 좌표 미세 확인만 최종 점검하세요.
export const weddingConfig: WeddingConfig = {
  meta: {
    title: '용중 & 진아 결혼합니다',
    description: '2027년 5월 22일 토요일 오후 12시 10분 · 원주 빌라드아모르 4층 르블랑포레홀',
    ogImage: '/og-image.jpg',
  },
  weddingDateISO: '2027-05-22T12:10:00+09:00',
  cover: {
    imageSrc: '/images/cover.webp',
    eyebrow: 'THE WEDDING OF',
    dateDisplay: '2027. 05. 22. SAT 12:10 PM',
    venueDisplay: '원주 빌라드아모르 · 4층 르블랑포레홀',
  },
  groom: {
    lastName: '조',
    firstName: '용중',
    englishName: 'Yongjung',
    relation: '장남',
    fatherName: '조강희',
    motherName: '심미숙',
  },
  bride: {
    lastName: '이',
    firstName: '진아',
    englishName: 'Jinah',
    relation: '장녀',
    fatherName: '이재학',
    motherName: '장보라',
  },
  greeting: {
    eyebrow: 'INVITATION',
    title: '소중한 분들을 초대합니다',
    paragraphs: [
      '다정한 햇살이 머무는 오월,\n서로의 가장 좋은 친구가 되었던 두 사람이\n이제 평생을 함께 걸어가려 합니다.',
      '깊은 신뢰와 사랑으로 첫 발을 내딛는 자리에\n귀한 발걸음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.',
    ],
  },
  gallery: [
    { id: 'g1', src: '/images/gallery-01.webp', alt: '웨딩 스냅 사진 1' },
    { id: 'g2', src: '/images/gallery-02.webp', alt: '웨딩 스냅 사진 2' },
    { id: 'g3', src: '/images/gallery-03.webp', alt: '웨딩 스냅 사진 3' },
    { id: 'g4', src: '/images/gallery-04.webp', alt: '웨딩 스냅 사진 4' },
    { id: 'g5', src: '/images/gallery-05.webp', alt: '웨딩 스냅 사진 5' },
    { id: 'g6', src: '/images/gallery-06.webp', alt: '웨딩 스냅 사진 6' },
    { id: 'g7', src: '/images/gallery-07.webp', alt: '웨딩 스냅 사진 7' },
    { id: 'g8', src: '/images/gallery-08.webp', alt: '웨딩 스냅 사진 8' },
    { id: 'g9', src: '/images/gallery-09.webp', alt: '웨딩 스냅 사진 9' },
    { id: 'g10', src: '/images/gallery-10.webp', alt: '웨딩 스냅 사진 10' },
    { id: 'g11', src: '/images/gallery-11.webp', alt: '웨딩 스냅 사진 11' },
    { id: 'g12', src: '/images/gallery-12.webp', alt: '웨딩 스냅 사진 12' },
    { id: 'g13', src: '/images/gallery-13.webp', alt: '웨딩 스냅 사진 13' },
    { id: 'g14', src: '/images/gallery-14.webp', alt: '웨딩 스냅 사진 14' },
    { id: 'g15', src: '/images/gallery-15.webp', alt: '웨딩 스냅 사진 15' },
  ],
  location: {
    venueName: '빌라드아모르 원주',
    hallName: '4층 르블랑포레홀',
    address: '강원특별자치도 원주시 북원로 2888',
    jibunAddress: '강원특별자치도 원주시 태장동 1914',
    lat: 37.40022632,
    lng: 127.95423691,
    naverPlaceId: '',
    kakaoPlaceId: '21341701',
    transportation: [
      {
        label: '자가용 및 주차',
        details: [
          '내비게이션에 "빌라드아모르 원주" 또는 "원주시 북원로 2888" 검색',
          '영동고속도로 원주 I.C 진출 후 횡성 방면(좌회전) 약 30m 전방 우측 위치',
          '건물 내 및 인근 전용 주차장 이용 가능 (약 1,000여 대 수용)',
        ],
      },
    ],
  },
  accounts: {
    notice: '참석이 어려우신 분들을 위해 감사한 마음으로 계좌번호를 기재하였습니다.',
    groomSide: [
      {
        id: 'g-1',
        role: '신랑',
        holder: '조용중',
        bank: '카카오뱅크',
        accountNumber: '3333-00-0000000',
      },
      {
        id: 'g-2',
        role: '신랑 아버지',
        holder: '조강희',
        bank: '국민은행',
        accountNumber: '000000-00-000000',
      },
    ],
    brideSide: [
      {
        id: 'b-1',
        role: '신부',
        holder: '이진아',
        bank: '신한은행',
        accountNumber: '110-000-000000',
      },
      {
        id: 'b-2',
        role: '신부 아버지',
        holder: '이재학',
        bank: '우리은행',
        accountNumber: '1002-000-000000',
      },
    ],
  },
  footer: {
    message: '늘 따뜻한 마음으로 축복해 주셔서 감사합니다.',
    copyright: 'YONGJUNG & JINAH · MAY 2027',
  },
};
