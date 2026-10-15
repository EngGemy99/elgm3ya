import type { Association } from "../types.ts";
import {
  cycleLabel,
  endDate,
  formatArabicDate,
  formatMoney,
  memberReceipt,
  payoutAmount,
  usedShares,
} from "../lib/schedule.ts";

interface AssociationCardProps {
  association: Association;
  onOpen: () => void;
}

export function AssociationCard({ association, onOpen }: AssociationCardProps) {
  const end = endDate(association.startDate, association.cycle, association.shareCount);
  const used = usedShares(association);
  const progress = Math.min(100, Math.round((used / association.shareCount) * 100));
  const me = association.members.find((member) => member.isSelf);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-line bg-white p-4 text-start shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">{association.name}</h2>
        <span className="shrink-0 rounded-full bg-green/10 px-3 py-1 text-sm font-semibold text-green">
          {association.role === "owner" ? "صاحبها" : "مشترك"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {cycleLabel(association.cycle)} · من {formatArabicDate(association.startDate)}
        {end ? ` إلى ${formatArabicDate(end)}` : ""}
      </p>
      <div className="mt-4">
        {association.role === "owner" ? (
          <>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted">الأسهم المشغولة</span>
              <span dir="ltr" className="font-semibold text-navy">
                {used}/{association.shareCount}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-navy/10">
              <div className="h-full shrink-0 rounded-full bg-green" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">عدد الأسهم مكتمل: {association.shareCount}</p>
        )}
        <p className="mt-3 text-sm font-semibold text-green">
          <span>القبض </span>
          <span dir="ltr">
            {formatMoney(
              me
                ? memberReceipt(association.shareCount, association.shareAmount, me.shares)
                : payoutAmount(association.shareCount, association.shareAmount),
            )}
          </span>
        </p>
      </div>
    </button>
  );
}
