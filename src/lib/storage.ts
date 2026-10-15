import type { Association, AssociationRole, Cycle, Member, ShareCount } from "../types.ts";

const STORAGE_KEY = "elgm3ya.associations";

function isShareCount(value: unknown): value is ShareCount {
  return value === 1 || value === 2 || value === 3;
}

function isCycle(value: unknown): value is Cycle {
  return value === "monthly" || value === "weekly";
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== "object") return false;
  const member = value as Partial<Member>;
  return (
    typeof member.id === "string" &&
    typeof member.name === "string" &&
    isShareCount(member.shares) &&
    Array.isArray(member.roundIndexes) &&
    member.roundIndexes.every((index) => Number.isInteger(index))
  );
}

function normalizeRole(value: unknown): AssociationRole {
  return value === "member" ? "member" : "owner";
}

function normalizeMember(member: Member): Member {
  return {
    id: member.id,
    name: member.name,
    shares: member.shares,
    isSelf: member.isSelf === true,
    roundIndexes: member.roundIndexes.filter((index) => Number.isInteger(index)),
  };
}

function normalizeShareAmount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function isAssociation(value: unknown): value is Association {
  if (!value || typeof value !== "object") return false;
  const association = value as Partial<Association>;
  return (
    typeof association.id === "string" &&
    typeof association.name === "string" &&
    isCycle(association.cycle) &&
    typeof association.shareCount === "number" &&
    Number.isInteger(association.shareCount) &&
    typeof association.startDate === "string" &&
    typeof association.createdAt === "string" &&
    Array.isArray(association.members) &&
    association.members.every(isMember)
  );
}

export function loadAssociations(): Association[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAssociation).map((association) => ({
      ...association,
      role: normalizeRole(association.role),
      shareAmount: normalizeShareAmount(association.shareAmount),
      members: association.members.map(normalizeMember),
    }));
  } catch {
    return [];
  }
}

export function saveAssociations(associations: Association[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(associations));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
