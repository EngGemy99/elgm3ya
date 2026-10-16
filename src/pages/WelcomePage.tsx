import logo from "../assets/elgamallogo.jpg";

interface WelcomePageProps {
  onStart: () => void;
}

export function WelcomePage({ onStart }: WelcomePageProps) {
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

        <button
          type="button"
          onClick={onStart}
          className="welcome-button mt-10 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-gradient-to-l from-cyan-400 to-sky-500 text-base font-bold text-navy shadow-[0_12px_30px_rgba(34,211,238,0.35)] transition active:scale-[0.98]"
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
}
