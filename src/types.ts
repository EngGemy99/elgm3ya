export type Cycle = "monthly" | "weekly";

export type ShareCount = 1 | 2 | 3;

export interface Member {
  id: string;
  name: string;
  shares: ShareCount;
  isSelf: boolean;
  roundIndexes: number[];
}

export interface Association {
  id: string;
  name: string;
  cycle: Cycle;
  shareCount: number;
  shareAmount: number;
  startDate: string;
  members: Member[];
  createdAt: string;
}
