import logo from "../assets/logo.png";
import { AssociationCard } from "../components/AssociationCard.tsx";
import type { Association } from "../types.ts";

interface HomePageProps {
  associations: Association[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}

export function HomePage({ associations, onCreate, onOpen }: HomePageProps) {
  return (
    <>
      <header className="shrink-0 bg-white px-5 pt-6 pb-4 text-center">
        <img src={logo} alt="الجمعية" className="mx-auto h-32 w-auto" />
      </header>

      <main className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        {associations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="text-lg font-bold text-navy">لا توجد جمعيات بعد</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              ابدأ بتنظيم أول جمعية، وحدّد نظامها وعدد أسهمها وموعد بدايتها.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {associations.map((association) => (
              <li key={association.id}>
                <AssociationCard association={association} onOpen={() => onOpen(association.id)} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onCreate}
          className="h-12 w-full rounded-2xl bg-navy text-base font-bold text-white shadow-sm"
        >
          جمعية جديدة
        </button>
      </div>
    </>
  );
}
