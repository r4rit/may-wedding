import { useState } from 'react';
import { ChevronDown, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { weddingConfig, type BankAccount } from '../data/weddingConfig';
import { copyToClipboard } from '../lib/clipboard';
import { FadeIn } from './FadeIn';

interface AccountAccordionProps {
  id: string;
  title: string;
  accounts: BankAccount[];
  isOpen: boolean;
  onToggle: () => void;
  onCopy: (accountNumber: string) => void;
}

function AccountAccordion({
  id,
  title,
  accounts,
  isOpen,
  onToggle,
  onCopy,
}: AccountAccordionProps) {
  return (
    <div className="border border-stone-line bg-linen/50">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={id}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-linen transition-colors cursor-pointer"
      >
        <span className="font-serif-kr text-[14.5px] text-ink">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-taupe transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.6}
        />
      </button>

      <div
        id={id}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-stone-line bg-ivory px-5 divide-y divide-stone-line/70">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="py-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-sans text-[12px] text-taupe">
                    {account.role}{' '}
                    <span className="text-ink font-medium ml-1">
                      {account.holder}
                    </span>
                  </p>
                  <p className="font-sans text-[13px] text-ink/90 tabular-nums">
                    <span className="text-taupe mr-1.5">{account.bank}</span>
                    {account.accountNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onCopy(account.accountNumber)}
                  aria-label={`${account.holder} 계좌번호 복사`}
                  className="shrink-0 inline-flex items-center gap-1 border border-stone-line bg-linen/70 hover:bg-linen active:scale-[0.98] transition-colors px-3 py-1.5 text-[11.5px] font-sans text-ink cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-taupe" strokeWidth={1.6} />
                  <span>복사</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Account() {
  const { accounts } = weddingConfig;
  const { showToast } = useToast();

  // 두 아코디언 모두 초기 상태 닫힘
  const [openGroom, setOpenGroom] = useState(false);
  const [openBride, setOpenBride] = useState(false);

  const handleCopyAccount = async (accountNumber: string) => {
    const copied = await copyToClipboard(accountNumber);
    if (copied) {
      showToast('계좌번호가 복사되었습니다', 'success');
    } else {
      showToast('계좌번호 복사에 실패했습니다', 'error');
    }
  };

  return (
    <section
      id="account"
      className="bg-ivory border-t border-stone-line/70 py-24 px-6"
    >
      <FadeIn>
        <div className="text-center">
          <p className="editorial-eyebrow">ACCOUNT</p>
          <h2 className="mt-3 font-serif-kr text-[19px] font-normal tracking-wide text-ink">
            마음 전하실 곳
          </h2>
          <p className="mt-4 font-serif-kr text-[13.5px] leading-[1.9] text-taupe break-keep">
            {accounts.notice}
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <AccountAccordion
            id="account-groom-panel"
            title="신랑측 계좌번호"
            accounts={accounts.groomSide}
            isOpen={openGroom}
            onToggle={() => setOpenGroom((prev) => !prev)}
            onCopy={handleCopyAccount}
          />

          <AccountAccordion
            id="account-bride-panel"
            title="신부측 계좌번호"
            accounts={accounts.brideSide}
            isOpen={openBride}
            onToggle={() => setOpenBride((prev) => !prev)}
            onCopy={handleCopyAccount}
          />
        </div>
      </FadeIn>
    </section>
  );
}
