import { Bus, Car, Copy, MapPin, TrainFront } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { weddingConfig } from '../data/weddingConfig';
import { copyToClipboard } from '../lib/clipboard';
import { openMapNavigation, type MapAppType } from '../lib/mapLinks';
import { FadeIn } from './FadeIn';
import { NaverMap } from './NaverMap';

const NAVIGATION_BUTTONS: {
  id: MapAppType;
  label: string;
  dotClassName: string;
}[] = [
  { id: 'naver', label: '네이버 지도', dotClassName: 'bg-[#03C75A]' },
  { id: 'kakao', label: '카카오맵', dotClassName: 'bg-[#E5B800]' },
  { id: 'tmap', label: '티맵', dotClassName: 'bg-[#2C6BFF]' },
];

function getTransportIcon(label: string) {
  if (label.includes('지하철')) {
    return <TrainFront className="w-3.5 h-3.5 text-bronze shrink-0" strokeWidth={1.6} />;
  }
  if (label.includes('버스')) {
    return <Bus className="w-3.5 h-3.5 text-bronze shrink-0" strokeWidth={1.6} />;
  }
  if (label.includes('자가용') || label.includes('주차')) {
    return <Car className="w-3.5 h-3.5 text-bronze shrink-0" strokeWidth={1.6} />;
  }
  return <MapPin className="w-3.5 h-3.5 text-bronze shrink-0" strokeWidth={1.6} />;
}

export function Location() {
  const { location } = weddingConfig;
  const { showToast } = useToast();

  const handleCopyAddress = async () => {
    const copied = await copyToClipboard(location.address);
    if (copied) {
      showToast('식장 주소가 복사되었습니다', 'success');
    } else {
      showToast('주소 복사에 실패했습니다', 'error');
    }
  };

  const handleOpenNavigation = (app: MapAppType) => {
    const result = openMapNavigation(app, location);
    if (result.status === 'desktop-unsupported' && result.message) {
      showToast(result.message);
    }
  };

  return (
    <section id="location" className="bg-ivory py-24 px-6">
      <FadeIn>
        <div className="text-center">
          <p className="editorial-eyebrow">LOCATION</p>
          <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
            오시는 길
          </h2>

          <div className="mt-7 space-y-1.5">
            <p className="font-serif-kr text-[17px] text-ink">
              {location.venueName}
            </p>
            <p className="font-sans text-[13.5px] text-taupe">
              {location.hallName}
            </p>
            <p className="pt-2 font-sans text-[13.5px] text-ink/90">
              {location.address}
            </p>
            {location.jibunAddress && (
              <p className="font-sans text-[12px] text-taupe">
                (지번) {location.jibunAddress}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyAddress}
            className="mt-4 inline-flex items-center gap-1.5 border border-stone-line bg-linen/70 hover:bg-linen active:scale-[0.99] transition-colors px-3.5 py-2 text-[12px] font-sans text-ink cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-taupe" strokeWidth={1.6} />
            <span>주소 복사</span>
          </button>
        </div>

        {/* 네이버 지도 */}
        <div className="mt-8">
          <NaverMap location={location} />
        </div>

        {/* 3종 내비게이션 앱 딥링크 (순서: 네이버 지도 -> 카카오맵 -> 티맵) */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {NAVIGATION_BUTTONS.map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => handleOpenNavigation(nav.id)}
              className="border border-stone-line bg-linen/75 hover:bg-linen active:scale-[0.99] transition-colors py-3 px-2 text-[12.5px] font-sans text-ink flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${nav.dotClassName}`}
              />
              <span className="truncate">{nav.label}</span>
            </button>
          ))}
        </div>

        {/* 교통편 및 주차 안내 */}
        <div className="mt-10 border-t border-stone-line pt-8 space-y-6">
          {location.transportation.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center gap-2">
                {getTransportIcon(item.label)}
                <h3 className="font-serif-kr text-[14.5px] font-normal text-ink">
                  {item.label}
                </h3>
              </div>
              <ul className="pl-5.5 space-y-1">
                {item.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="font-sans text-[13px] leading-relaxed text-ink/75 break-keep"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
