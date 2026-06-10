// Priority Score engine (Module 3).
// Score 0-100 from weighted, compliance-neutral inputs. Higher = work first.

export interface PriorityInputs {
  audienceRelevance: number;   // 0-5  how on-topic (GLP-1/peptide/weight tracking)
  followerScore: number;       // 0-5  reach (bucketed, not raw count — avoid chasing vanity)
  engagementLikelihood: number;// 0-5  do they reply / are they reachable & responsive
  directRelevance: number;     // 0-5  direct GLP-1/peptide/weight-loss focus
  trustLevel: number;          // 0-5  reputable, not a drug-seller / spam account
  easeOfContact: number;       // 0-5  public contact path exists & is permitted
  conversionImpact: number;    // 0-5  likely to drive real installs/partners
}

const WEIGHTS: Record<keyof PriorityInputs, number> = {
  audienceRelevance: 0.20,
  followerScore: 0.10,
  engagementLikelihood: 0.15,
  directRelevance: 0.20,
  trustLevel: 0.15,
  easeOfContact: 0.10,
  conversionImpact: 0.10,
};

export function priorityScore(i: PriorityInputs): number {
  let total = 0;
  (Object.keys(WEIGHTS) as (keyof PriorityInputs)[]).forEach((k) => {
    const v = Math.max(0, Math.min(5, i[k] ?? 0));
    total += (v / 5) * WEIGHTS[k];
  });
  return Math.round(total * 100);
}

/** Map a raw follower count into the 0-5 follower bucket. */
export function followerBucket(count?: number | null): number {
  const n = count ?? 0;
  if (n >= 250_000) return 5;
  if (n >= 100_000) return 4;
  if (n >= 25_000) return 3;
  if (n >= 5_000) return 2;
  if (n >= 1_000) return 1;
  return 0;
}

export function priorityTier(score: number): "A" | "B" | "C" {
  if (score >= 70) return "A";
  if (score >= 45) return "B";
  return "C";
}
