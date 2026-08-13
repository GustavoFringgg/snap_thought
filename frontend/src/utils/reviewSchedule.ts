import type { ReviewStage } from "../types";

export function getWeekOfMonth(date: Date): number {
  return Math.min(Math.ceil(date.getDate() / 7), 4);
}

// Week1/3: Mon/Tue→L, Wed/Thu/Fri→L+LL
// Week2/4: Mon→L+LL+LLL, Tue~Fri→L+LLL
// dayIndex: 0=Mon .. 4=Fri
export function getReviewStages(weekOfMonth: number, dayIndex: number): ReviewStage[] {
  const isOddWeek = weekOfMonth % 2 === 1;
  if (isOddWeek) {
    return dayIndex <= 1 ? ["L"] : ["L", "LL"];
  }
  return dayIndex === 0 ? ["L", "LL", "LLL"] : ["L", "LLL"];
}

export function getReviewLabel(stages: ReviewStage[]): string {
  return stages.join(" + ");
}

// Today's actual schedule, independent of whichever week is being browsed.
// Weekends have no scheduled day, so all stages are eligible for review.
export function getTodayReviewStages(): ReviewStage[] {
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun..6=Sat
  if (jsDay === 0 || jsDay === 6) return ["L", "LL", "LLL"];
  const dayIndex = jsDay - 1; // Mon=0..Fri=4
  return getReviewStages(getWeekOfMonth(now), dayIndex);
}

// Local calendar date (YYYY-MM-DD), used to track whether a note has
// already been reviewed today regardless of its current stage.
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
