import logo from "../assets/elgamallogo.jpg";
import { useInstallPrompt } from "../hooks/useInstallPrompt.ts";

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
  const { installed, ios, helpOpen, install, dismissHelp } = useInstallPrompt();

  return (
    <div className="welcome-screen relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="welcome-glow welcome-glow-a" aria-hidden="true" />
      <div className="welcome-glow welcome-glow-b" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="welcome-logo-wrap">
          <img
            src={logo}
            alt="ElGamal Systems"
            className="welcome-logo h-auto w-[min(78vw,18rem)] rounded-full shadow-[0_0_40px_rgba(34,211,238,0.28)]"
          />
        </div>

        <h1 className="welcome-title mt-8 text-[1.65rem] leading-relaxed font-bold text-white sm:text-3xl">
          الجمل للانظمة الحديثة
        </h1>

        <p className="welcome-subtitle mt-3 text-sm text-cyan-100/70">نظم جمعيتك بكل سهولة</p>

        <div className="welcome-button mt-10 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-cyan-400 to-sky-500 text-base font-bold text-navy shadow-[0_12px_30px_rgba(34,211,238,0.35)] transition active:scale-[0.98]"
          >
            ابدأ الآن
          </button>

          {installed ? (
            <p className="text-sm font-semibold text-cyan-100/80">التطبيق مثبت على جهازك</p>
          ) : (
            <button
              type="button"
              onClick={() => void install()}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-cyan-300/40 bg-white/10 text-base font-bold text-white backdrop-blur-sm transition active:scale-[0.98]"
            >
              تنزيل التطبيق
            </button>
          )}
        </div>
      </div>

      {helpOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-start shadow-xl">
            <h2 className="text-lg font-bold text-navy">
              {ios ? "تثبيت على الآيفون" : "تثبيت التطبيق"}
            </h2>
            {ios ? (
              <ol className="mt-3 list-decimal space-y-2 pe-5 text-sm leading-6 text-muted">
                <li>اضغط زر المشاركة في أسفل سفاري.</li>
                <li>اختَر «إضافة إلى الشاشة الرئيسية».</li>
                <li>اضغط «إضافة» عشان التطبيق يظهر مع باقي البرامج.</li>
              </ol>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                افتح الموقع من كروم أو إيدج على الموبايل، ومن قائمة المتصفح اختَر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». التثبيت يظهر بعد نشر التطبيق على رابط آمن HTTPS.
              </p>
            )}
            <button
              type="button"
              onClick={dismissHelp}
              className="mt-5 h-12 w-full rounded-2xl bg-navy font-bold text-white"
            >
              تمام
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
