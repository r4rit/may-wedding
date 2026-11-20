import type { LocationInfo } from '../data/weddingConfig';

export type MapAppType = 'naver' | 'kakao' | 'tmap';

export interface MapOpenResult {
  status: 'opened' | 'desktop-unsupported';
  message?: string;
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openAppWithFallback(appUrl: string, fallbackUrl: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let timerId: number | null = null;

  const cleanup = () => {
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      cleanup();
    }
  };

  const handlePageHide = () => {
    cleanup();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handlePageHide);

  timerId = window.setTimeout(() => {
    const stillVisible = document.visibilityState === 'visible';
    cleanup();
    if (stillVisible) {
      window.location.href = fallbackUrl;
    }
  }, 1500);

  window.location.href = appUrl;
}

export function openMapNavigation(
  app: MapAppType,
  location: LocationInfo,
): MapOpenResult {
  const encodedName = encodeURIComponent(location.venueName);
  const mobile = isMobileDevice();

  if (app === 'naver') {
    const appOrigin =
      typeof window !== 'undefined'
        ? encodeURIComponent(window.location.origin)
        : 'may-wedding';
    const appUrl = `nmap://place?lat=${location.lat}&lng=${location.lng}&name=${encodedName}&appname=${appOrigin}`;
    const webFallback = location.naverPlaceId
      ? `https://map.naver.com/p/entry/place/${location.naverPlaceId}`
      : `https://map.naver.com/p/search/${encodeURIComponent(location.address)}`;

    if (mobile) {
      openAppWithFallback(appUrl, webFallback);
    } else {
      window.open(webFallback, '_blank', 'noopener,noreferrer');
    }

    return { status: 'opened' };
  }

  if (app === 'kakao') {
    const appUrl = location.kakaoPlaceId
      ? `kakaomap://place?id=${location.kakaoPlaceId}`
      : `kakaomap://look?p=${location.lat},${location.lng}`;
    const webFallback = location.kakaoPlaceId
      ? `https://map.kakao.com/link/map/${location.kakaoPlaceId}`
      : `https://map.kakao.com/link/map/${encodedName},${location.lat},${location.lng}`;

    if (mobile) {
      openAppWithFallback(appUrl, webFallback);
    } else {
      window.open(webFallback, '_blank', 'noopener,noreferrer');
    }

    return { status: 'opened' };
  }

  // 티맵(TMAP): goalx = 경도(lng), goaly = 위도(lat) 순서 엄수
  if (!mobile) {
    return {
      status: 'desktop-unsupported',
      message: '티맵 길찾기는 모바일 기기에서 이용 가능합니다',
    };
  }

  const appUrl = `tmap://route?goalname=${encodedName}&goalx=${location.lng}&goaly=${location.lat}`;
  const storeFallback = isIosDevice()
    ? 'https://apps.apple.com/kr/app/id431589174'
    : 'https://play.google.com/store/apps/details?id=com.skt.tmap.ku';

  openAppWithFallback(appUrl, storeFallback);
  return { status: 'opened' };
}
