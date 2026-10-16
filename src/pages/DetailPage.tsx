import { useMemo, useState, type FormEvent } from "react";
import {
  cycleLabel,
  cyclePaymentLabel,
  endDate,
  formatArabicDate,
  formatMoney,
  memberPayment,
  memberReceipt,
  payoutAmount,
  roundDate,
  takenRoundIndexes,
  toISODate,
  usedShares,
} from "../lib/schedule.ts";
import { createId } from "../lib/storage.ts";
import type { Association, Member, ShareCount } from "../types.ts";

function selectRound(current: number[], index: number, limit: number): number[] {
  if (current.includes(index)) return current.filter((item) => item !== index);
  if (current.length < limit) return [...current, index];
  return [...current.slice(1), index];
}

interface DetailPageProps {
  association: Association | undefined;
  onBack: () => void;
  onEdit?: (id: string) => void;
  onChange: (association: Association) => void;
  onDelete: (id: string) => void;
}

export function DetailPage({ association, onBack, onEdit, onChange, onDelete }: DetailPageProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!association) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-bold text-navy">الجمعية غير موجودة</p>
        <button type="button" onClick={onBack} className="h-12 rounded-2xl bg-navy px-6 font-bold text-white">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const end = endDate(association.startDate, association.cycle, association.shareCount);
  const isOwner = association.role === "owner";
  const used = usedShares(association);
  const remaining = association.shareCount - used;
  const payout = payoutAmount(association.shareCount, association.shareAmount);

  function removeMember(memberId: string) {
    onChange({
      ...association!,
      members: association!.members.filter((member) => member.id !== memberId),
    });
  }

  function addMember(member: Member) {
    onChange({
      ...association!,
      members: [...association!.members, member],
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
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-navy">{association.name}</h1>
      </header>

      <main className="scroll-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <section className="rounded-2xl bg-navy p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
              {isOwner ? "صاحبها" : "مشترك فقط"}
            </span>
            <span className="text-sm">{cycleLabel(association.cycle)}</span>
          </div>
          <p className="mt-4 text-sm text-white/75">من {formatArabicDate(association.startDate)}</p>
          <p className="text-lg font-bold">{end ? `إلى ${formatArabicDate(end)}` : ""}</p>
          {isOwner ? (
            <>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full shrink-0 rounded-full bg-green"
                  style={{ width: `${Math.min(100, (used / association.shareCount) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-white/80">
                {remaining > 0
                  ? `المتبقي ${remaining} ${remaining === 1 ? "سهم" : "أسهم"}`
                  : "كل الأسهم اتوزعت"}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-white/80">
              عدد الأسهم مكتمل: {association.shareCount}. مش محتاج تضيف حد.
            </p>
          )}
          {association.shareAmount > 0 ? (
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <p className="flex items-center justify-between gap-3">
                <span className="text-white/75">كل فرد يدفع</span>
                <span dir="ltr" className="font-semibold">
                  {formatMoney(association.shareAmount)}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="text-white/75">صاحب الدور يقبض</span>
                <span dir="ltr" className="font-semibold">
                  {formatMoney(payout)}
                </span>
              </p>
            </div>
          ) : null}
        </section>

        {isOwner ? <MyRounds association={association} /> : null}

        {isOwner && remaining > 0 ? (
          <MemberForm association={association} remaining={remaining} onAdd={addMember} />
        ) : null}

        {isOwner ? null : (
          <>
            <ParticipantTurn association={association} onChange={onChange} />
            <MyRounds association={association} />
          </>
        )}

        {isOwner ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-navy">المشتركون</h2>
          {association.members.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-muted shadow-sm">لم يُضف مشتركون بعد</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {association.members.map((member) => (
                <li key={member.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-navy">
                        {member.name}
                        {member.isSelf ? (
                          <span className="ms-2 rounded-full bg-green/10 px-2 py-0.5 text-xs font-semibold text-green">
                            أنا
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {member.shares} {member.shares === 1 ? "سهم" : "أسهم"}
                      </p>
                      <p className="mt-1 text-sm text-navy">
                        يدفع <span dir="ltr">{formatMoney(memberPayment(association.shareAmount, member.shares))}</span>
                        <span className="text-muted"> {cyclePaymentLabel(association.cycle)}</span>
                      </p>
                      <p className="mt-1 text-sm text-green">
                        يقبض <span dir="ltr">{formatMoney(memberReceipt(association.shareCount, association.shareAmount, member.shares))}</span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-navy">
                        {member.roundIndexes
                          .slice()
                          .sort((left, right) => left - right)
                          .map((index) => {
                            const date = roundDate(association.startDate, association.cycle, index);
                            return date ? `دور ${index + 1} · ${formatArabicDate(date)}` : "";
                          })
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="h-11 rounded-2xl px-3 text-sm font-semibold text-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        ) : null}

        {onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(association.id)}
            className="mt-2 h-12 rounded-2xl border border-line bg-white font-bold text-navy"
          >
            تعديل الجمعية
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="h-12 rounded-2xl border border-red-200 bg-white font-bold text-red-700"
        >
          حذف الجمعية
        </button>
      </main>

      {confirmDelete ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-navy">حذف الجمعية؟</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              هتتحذف «{association.name}» من هذا الجهاز، ومش هتقدر ترجعها.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-12 rounded-2xl bg-page font-bold text-navy"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => onDelete(association.id)}
                className="h-12 rounded-2xl bg-red-700 font-bold text-white"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MemberForm({
  association,
  remaining,
  onAdd,
}: {
  association: Association;
  remaining: number;
  onAdd: (member: Member) => void;
}) {
  const maxShares = Math.min(3, remaining) as ShareCount;
  const [name, setName] = useState("");
  const [shares, setShares] = useState<ShareCount>(1);
  const [isSelf, setIsSelf] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState("");

  const taken = useMemo(() => takenRoundIndexes(association), [association]);
  const selfTaken = association.members.some((member) => member.isSelf);
  const activeShares: ShareCount = shares > maxShares ? maxShares : shares;

  function toggleRound(index: number) {
    setSelected((current) => selectRound(current, index, activeShares));
  }

  function chooseShares(next: ShareCount) {
    setShares(next);
    setSelected((current) => current.slice(0, next));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      setError("اكتب اسم المشترك");
      return;
    }
    if (selected.length !== activeShares) {
      setError(`اختر ${activeShares} ${activeShares === 1 ? "دور" : "أدوار"}`);
      return;
    }
    if (selected.some((index) => taken.has(index) || index < 0 || index >= association.shareCount)) {
      setError("في دور مش متاح");
      return;
    }

    onAdd({
      id: createId(),
      name: trimmed,
      shares: activeShares,
      isSelf: isSelf && !selfTaken,
      roundIndexes: selected.slice().sort((a, b) => a - b),
    });
    setName("");
    setShares(1);
    setIsSelf(false);
    setSelected([]);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-navy">إضافة مشترك</h2>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold">اسم المشترك</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          placeholder="اسم الشخص"
          className="h-12 rounded-2xl border border-line px-4 outline-none focus:border-green"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">كم سهم؟</span>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((option) => {
            const disabled = option > remaining;
            const pressed = activeShares === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={pressed}
                onClick={() => chooseShares(option)}
                className={`h-12 rounded-2xl font-bold disabled:opacity-40 ${
                  pressed ? "bg-green text-white" : "bg-page text-navy"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {selfTaken ? null : (
        <button
          type="button"
          aria-pressed={isSelf}
          onClick={() => setIsSelf((current) => !current)}
          className={`h-12 rounded-2xl font-bold ${isSelf ? "bg-green text-white" : "bg-page text-navy"}`}
        >
          أنا المشترك ده
        </button>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          اديله {activeShares} {activeShares === 1 ? "دور" : "أدوار"} ({selected.length}/{activeShares})
        </span>
        <div className="scroll-area flex max-h-52 flex-col gap-2 overflow-y-auto pe-1">
          {Array.from({ length: association.shareCount }, (_, index) => {
            const date = roundDate(association.startDate, association.cycle, index);
            const isTaken = taken.has(index);
            const isSelected = selected.includes(index);
            return (
              <button
                key={index}
                type="button"
                disabled={isTaken}
                onClick={() => toggleRound(index)}
                className={`flex min-h-12 items-center justify-between rounded-2xl px-3 text-sm disabled:opacity-45 ${
                  isSelected ? "bg-green/15 font-bold text-green" : "bg-page text-navy"
                }`}
              >
                <span>دور {index + 1}</span>
                <span>{date ? formatArabicDate(toISODate(date)) : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

      <button type="submit" className="h-12 rounded-2xl bg-navy font-bold text-white">
        إضافة
      </button>
    </form>
  );
}

function ParticipantTurn({
  association,
  onChange,
}: {
  association: Association;
  onChange: (association: Association) => void;
}) {
  const me = association.members.find((member) => member.isSelf);
  const maxShares = Math.min(3, association.shareCount) as ShareCount;
  const [shares, setShares] = useState<ShareCount>(me?.shares && me.shares <= maxShares ? me.shares : 1);
  const [selected, setSelected] = useState<number[]>(me?.roundIndexes ?? []);
  const [error, setError] = useState("");
  const activeShares: ShareCount = shares > maxShares ? maxShares : shares;

  function toggleRound(index: number) {
    setSelected((current) => selectRound(current, index, activeShares));
  }

  function chooseShares(next: ShareCount) {
    setShares(next);
    setSelected((current) => current.slice(0, next));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (selected.length !== activeShares) {
      setError(`اختر ${activeShares} ${activeShares === 1 ? "دور" : "أدوار"}`);
      return;
    }

    onChange({
      ...association,
      members: [
        {
          id: me?.id ?? createId(),
          name: "أنا",
          shares: activeShares,
          isSelf: true,
          roundIndexes: selected.slice().sort((left, right) => left - right),
        },
      ],
    });
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-navy">الدور اللي هتقبض فيه</h2>
      <p className="text-sm leading-6 text-muted">عدد الأسهم مكتمل، ومش هتضيف مشتركين. اختار دورك بس.</p>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">كم سهم ليك؟</span>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((option) => {
            const disabled = option > association.shareCount;
            const pressed = activeShares === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                aria-pressed={pressed}
                onClick={() => chooseShares(option)}
                className={`h-12 rounded-2xl font-bold disabled:opacity-40 ${
                  pressed ? "bg-green text-white" : "bg-page text-navy"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">
          اختر {activeShares} {activeShares === 1 ? "دور" : "أدوار"} ({selected.length}/{activeShares})
        </span>
        <div className="scroll-area flex max-h-52 flex-col gap-2 overflow-y-auto pe-1">
          {Array.from({ length: association.shareCount }, (_, index) => {
            const date = roundDate(association.startDate, association.cycle, index);
            const isSelected = selected.includes(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => toggleRound(index)}
                className={`flex min-h-12 items-center justify-between rounded-2xl px-3 text-sm ${
                  isSelected ? "bg-green/15 font-bold text-green" : "bg-page text-navy"
                }`}
              >
                <span>دور {index + 1}</span>
                <span>{date ? formatArabicDate(toISODate(date)) : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
      <button type="submit" className="h-12 rounded-2xl bg-navy font-bold text-white">
        {me ? "تحديث دورى" : "حفظ دورى"}
      </button>
    </form>
  );
}

function MyRounds({ association }: { association: Association }) {
  const me = association.members.find((member) => member.isSelf);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-navy">أدوارى</h2>
      {!me ? (
        <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-muted shadow-sm">
          {association.role === "owner"
            ? "علّم «أنا المشترك ده» وأنت بتضيف نفسك عشان تشوف مواعيد أدوارك."
            : "اختار الدور اللي هتقبض فيه."}
        </p>
      ) : (
        <>
          <p className="text-sm text-navy">
            بتدفع <span dir="ltr">{formatMoney(memberPayment(association.shareAmount, me.shares))}</span>
            <span className="text-muted"> {cyclePaymentLabel(association.cycle)}</span>
          </p>
          <p className="text-sm font-semibold text-green">
            هتقبض <span dir="ltr">{formatMoney(memberReceipt(association.shareCount, association.shareAmount, me.shares))}</span>
          </p>
          <ol className="flex flex-col gap-2">
            {me.roundIndexes
              .slice()
              .sort((a, b) => a - b)
              .map((index) => {
                const date = roundDate(association.startDate, association.cycle, index);
                return (
                  <li key={index} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">دور {index + 1}</p>
                      <p className="text-sm text-muted">{date ? formatArabicDate(date) : ""}</p>
                    </div>
                  </li>
                );
              })}
          </ol>
        </>
      )}
    </section>
  );
}
