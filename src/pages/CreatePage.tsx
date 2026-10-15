import { useMemo, useState, type FormEvent } from "react";
import { createId } from "../lib/storage.ts";
import {
  cycleLabel,
  cyclePaymentLabel,
  endDate,
  formatArabicDate,
  formatMoney,
  memberPayment,
  memberReceipt,
  parseAmount,
  payoutAmount,
  todayISO,
} from "../lib/schedule.ts";
import type { Association, AssociationRole, Cycle } from "../types.ts";

interface CreatePageProps {
  onBack: () => void;
  onCreate: (association: Association) => void;
}

const MIN_SHARES = 2;
const MAX_SHARES = 60;

export function CreatePage({ onBack, onCreate }: CreatePageProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<AssociationRole>("owner");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [shareCount, setShareCount] = useState(10);
  const [shareAmount, setShareAmount] = useState("");
  const [startDate, setStartDate] = useState(todayISO);
  const [error, setError] = useState("");

  const previewEnd = useMemo(
    () => endDate(startDate, cycle, shareCount),
    [startDate, cycle, shareCount],
  );
  const parsedAmount = parseAmount(shareAmount);
  const payout = parsedAmount ? payoutAmount(shareCount, parsedAmount) : 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      setError("اكتب اسم الجمعية");
      return;
    }
    if (!Number.isInteger(shareCount) || shareCount < MIN_SHARES || shareCount > MAX_SHARES) {
      setError(`عدد الأسهم من ${MIN_SHARES} إلى ${MAX_SHARES}`);
      return;
    }
    if (!parsedAmount) {
      setError("اكتب المبلغ اللي هيدفعه كل فرد");
      return;
    }
    if (!previewEnd) {
      setError("تاريخ البداية غير صالح");
      return;
    }

    onCreate({
      id: createId(),
      name: trimmed,
      role,
      cycle,
      shareCount,
      shareAmount: parsedAmount,
      startDate,
      members: [],
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 px-4 pt-5 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg text-navy shadow-sm"
          aria-label="رجوع"
        >
          →
        </button>
        <h1 className="text-xl font-bold text-navy">جمعية جديدة</h1>
      </header>

      <form onSubmit={handleSubmit} className="scroll-area flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">اسم الجمعية</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="مثال: جمعية العيلة"
            className="h-12 rounded-2xl border border-line bg-white px-4 text-base outline-none focus:border-green"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-navy">دورك في الجمعية</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["owner", "صاحبها"],
                ["member", "مشترك فقط"],
              ] as const
            ).map(([option, label]) => {
              const selected = role === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`h-12 rounded-2xl text-base font-bold ${
                    selected ? "bg-navy text-white" : "bg-white text-navy shadow-sm"
                  }`}
                  aria-pressed={selected}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-muted">
            {role === "owner"
              ? "هتضيف المشتركين وتدي كل واحد دوره."
              : "عدد الأسهم مكتمل. هتختار بس الدور اللي هتقبض فيه."}
          </span>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-navy">نظام الجمعية</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["monthly", "weekly"] as const).map((option) => {
              const selected = cycle === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCycle(option)}
                  className={`h-12 rounded-2xl text-base font-bold ${
                    selected ? "bg-navy text-white" : "bg-white text-navy shadow-sm"
                  }`}
                  aria-pressed={selected}
                >
                  {cycleLabel(option)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">عدد الأسهم</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareCount((count) => Math.max(MIN_SHARES, count - 1))}
              className="h-12 w-12 rounded-2xl bg-white text-2xl text-navy shadow-sm"
              aria-label="تقليل عدد الأسهم"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_SHARES}
              max={MAX_SHARES}
              value={shareCount}
              onChange={(event) => setShareCount(Number(event.target.value))}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-white text-center text-lg font-bold outline-none focus:border-green"
            />
            <button
              type="button"
              onClick={() => setShareCount((count) => Math.min(MAX_SHARES, count + 1))}
              className="h-12 w-12 rounded-2xl bg-white text-2xl text-navy shadow-sm"
              aria-label="زيادة عدد الأسهم"
            >
              +
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">كم يدفع كل فرد؟</span>
          <input
            value={shareAmount}
            onChange={(event) => setShareAmount(event.target.value)}
            inputMode="decimal"
            placeholder="1000"
            className="h-12 rounded-2xl border border-line bg-white px-4 text-base outline-none focus:border-green"
          />
          <span className="text-sm text-muted">ده مبلغ السهم الواحد. لو دخل بسهمين يدفع الضعف.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">موعد البدء</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-12 rounded-2xl border border-line bg-white px-4 text-base outline-none focus:border-green"
          />
        </label>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-muted">موعد الانتهاء يتحسب تلقائيًا</p>
          <p className="mt-1 text-lg font-bold text-green">
            {previewEnd ? formatArabicDate(previewEnd) : "تاريخ غير صالح"}
          </p>
          <p className="mt-2 text-sm text-navy">
            {shareCount} {shareCount === 1 ? "دور" : "أدوار"} · {cycleLabel(cycle)}
          </p>
          {parsedAmount ? (
            <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="text-muted">كل فرد يدفع</span>
                <span dir="ltr" className="font-bold text-navy">
                  {formatMoney(parsedAmount)}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="text-muted">صاحب الدور يقبض</span>
                <span dir="ltr" className="font-bold text-green">
                  {formatMoney(payout)}
                </span>
              </p>
              <p className="text-muted">
                {cyclePaymentLabel(cycle)}. لو دخل بسهمين يدفع{" "}
                <span dir="ltr">{formatMoney(memberPayment(parsedAmount, 2))}</span> ويقبض{" "}
                <span dir="ltr">{formatMoney(memberReceipt(shareCount, parsedAmount, 2))}</span>.
              </p>
            </div>
          ) : null}
        </section>

        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

        <button
          type="submit"
          className="mt-auto h-12 rounded-2xl bg-green text-base font-bold text-white"
        >
          حفظ الجمعية
        </button>
      </form>
    </>
  );
}
