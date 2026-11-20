import { useEffect, useRef, useState } from 'react';
import { Lock, MapPin, Unlock } from 'lucide-react';
import type { LocationInfo } from '../data/weddingConfig';

interface NaverLatLng {
  readonly lat?: () => number;
  readonly lng?: () => number;
}

interface NaverMapOptions {
  center?: NaverLatLng;
  zoom?: number;
  draggable?: boolean;
  pinchZoom?: boolean;
  scrollWheel?: boolean;
  keyboardShortcuts?: boolean;
  disableDoubleTapZoom?: boolean;
  disableDoubleClickZoom?: boolean;
  scaleControl?: boolean;
  mapDataControl?: boolean;
}

interface NaverMapInstance {
  setOptions: (options: NaverMapOptions) => void;
}

interface NaverMapsNamespace {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMapInstance;
  Marker: new (options: {
    position: NaverLatLng;
    map: NaverMapInstance;
  }) => unknown;
}

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapsNamespace;
    };
    navermap_authFailure?: () => void;
  }
}

interface NaverMapProps {
  location: LocationInfo;
}

export function NaverMap({ location }: NaverMapProps) {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim() ?? '';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(() =>
    clientId ? 'loading' : 'fallback',
  );
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setStatus('fallback');
      return;
    }

    let cancelled = false;

    const initMap = () => {
      if (cancelled) return;
      const container = mapContainerRef.current;
      const naverMaps = window.naver?.maps;
      if (!container || !naverMaps) {
        setStatus('fallback');
        return;
      }

      try {
        const center = new naverMaps.LatLng(location.lat, location.lng);
        const map = new naverMaps.Map(container, {
          center,
          zoom: 16,
          draggable: false,
          pinchZoom: false,
          scrollWheel: false,
          keyboardShortcuts: false,
          disableDoubleTapZoom: true,
          disableDoubleClickZoom: true,
          scaleControl: false,
          mapDataControl: false,
        });

        new naverMaps.Marker({
          position: center,
          map,
        });

        mapInstanceRef.current = map;
        setStatus('ready');
      } catch {
        setStatus('fallback');
      }
    };

    window.navermap_authFailure = () => {
      if (!cancelled) {
        setStatus('fallback');
      }
    };

    if (window.naver?.maps) {
      initMap();
      return () => {
        cancelled = true;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-naver-maps-sdk="true"]',
    );

    const handleLoad = () => initMap();
    const handleError = () => {
      if (!cancelled) {
        setStatus('fallback');
      }
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return () => {
        cancelled = true;
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.defer = true;
    script.dataset.naverMapsSdk = 'true';
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [clientId, location.lat, location.lng]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setOptions({
      draggable: isUnlocked,
      pinchZoom: isUnlocked,
      scrollWheel: isUnlocked,
      disableDoubleTapZoom: !isUnlocked,
      disableDoubleClickZoom: !isUnlocked,
    });
  }, [isUnlocked]);

  if (status === 'fallback') {
    return (
      <div
        className="w-full aspect-[16/10] bg-linen border border-stone-line relative overflow-hidden flex flex-col items-center justify-center px-6 text-center"
        aria-label={`${location.venueName} 위치 안내 카드`}
      >
        {/* 은은한 에디토리얼 그리드 배경 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-45 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(229,223,215,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(229,223,215,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-3 border border-stone-line/80 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-rose-clay/15 flex items-center justify-center mb-2.5">
            <MapPin className="w-4 h-4 text-rose-clay" strokeWidth={1.6} />
          </div>
          <p className="font-serif-kr text-[15px] text-ink">
            {location.venueName} · {location.hallName}
          </p>
          <p className="mt-1 font-sans text-[12.5px] text-taupe">
            {location.address}
          </p>
          <p className="mt-2 font-serif-en text-[11px] tracking-[0.16em] text-taupe/75 tabular-nums">
            {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
          </p>
          <p className="mt-2.5 font-sans text-[11px] text-taupe/80">
            아래 내비게이션 버튼으로 바로 길찾기를 이용하실 수 있습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/10] bg-linen border border-stone-line relative overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {status === 'loading' && (
        <div className="absolute inset-0 bg-linen flex items-center justify-center">
          <p className="font-serif-kr text-[12.5px] text-taupe">
            지도를 불러오는 중입니다...
          </p>
        </div>
      )}

      {/* 모바일 세로 스크롤 간섭 방지 투명 오버레이 */}
      {status === 'ready' && !isUnlocked && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-transparent"
        />
      )}

      {status === 'ready' && (
        <button
          type="button"
          onClick={() => setIsUnlocked((prev) => !prev)}
          aria-pressed={isUnlocked}
          className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-ivory/92 backdrop-blur-sm border border-stone-line px-3 py-1.5 text-[11px] font-sans text-ink shadow-sm hover:bg-ivory transition-colors cursor-pointer"
        >
          {isUnlocked ? (
            <>
              <Unlock className="w-3 h-3 text-rose-clay" strokeWidth={1.7} />
              <span>지도 잠금</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-taupe" strokeWidth={1.7} />
              <span>지도 잠금 해제</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
