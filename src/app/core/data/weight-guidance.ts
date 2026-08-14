export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

interface GainProfile {
  /** Cumulative kg gain by end of first trimester (week 13). */
  firstTrimester: [number, number];
  /** kg/week gain during the 2nd and 3rd trimesters. */
  weeklyRate: [number, number];
  /** Total recommended gain over the full pregnancy. */
  total: [number, number];
}

// Institute of Medicine (IOM) gestational weight gain guidelines by pre-pregnancy BMI.
const GAIN_PROFILES: Record<BmiCategory, GainProfile> = {
  underweight: { firstTrimester: [0.5, 2], weeklyRate: [0.44, 0.58], total: [12.5, 18] },
  normal: { firstTrimester: [0.5, 2], weeklyRate: [0.35, 0.5], total: [11.5, 16] },
  overweight: { firstTrimester: [0.5, 2], weeklyRate: [0.23, 0.33], total: [7, 11.5] },
  obese: { firstTrimester: [0.5, 2], weeklyRate: [0.17, 0.27], total: [5, 9] },
};

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: 'Ispod normalne težine',
  normal: 'Normalna težina',
  overweight: 'Prekomerna težina',
  obese: 'Gojaznost',
};

export function bmiCategoryFor(heightCm: number, prePregnancyWeightKg: number): BmiCategory {
  const heightM = heightCm / 100;
  const bmi = prePregnancyWeightKg / (heightM * heightM);
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

/** Cumulative recommended weight-gain range (kg) by the given week, per IOM guidelines. */
export function recommendedGainRangeForWeek(category: BmiCategory, week: number): [number, number] {
  const profile = GAIN_PROFILES[category];
  const w = Math.min(Math.max(week, 0), 40);

  if (w <= 13) {
    const t = w / 13;
    return [profile.firstTrimester[0] * t, profile.firstTrimester[1] * t];
  }

  const extraWeeks = w - 13;
  const min = profile.firstTrimester[0] + profile.weeklyRate[0] * extraWeeks;
  const max = profile.firstTrimester[1] + profile.weeklyRate[1] * extraWeeks;
  return [Math.min(min, profile.total[1]), Math.min(max, profile.total[1])];
}

export function recommendedWeightRangeForWeek(
  category: BmiCategory,
  prePregnancyWeightKg: number,
  week: number,
): [number, number] {
  const [minGain, maxGain] = recommendedGainRangeForWeek(category, week);
  return [prePregnancyWeightKg + minGain, prePregnancyWeightKg + maxGain];
}

export function totalRecommendedGain(category: BmiCategory): [number, number] {
  return GAIN_PROFILES[category].total;
}
