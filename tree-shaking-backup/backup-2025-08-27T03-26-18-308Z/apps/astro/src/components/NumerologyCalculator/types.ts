export interface NumerologyData {
  name: string;
  year: number;
  month: number;
  day: number;
}

export interface CoreNumbers {
  life_path: {
    number: number;
    meaning: string;
    components?: { month: number; day: number; year: number };
  };
  destiny: {
    number: number;
    meaning: string;
  };
  soul_urge: {
    number: number;
    meaning: string;
  };
  personality: {
    number: number;
    meaning: string;
  };
  birth_day: {
    number: number;
    meaning: string;
  };
  attitude: {
    number: number;
    meaning: string;
  };
  power_name: {
    number: number;
    meaning: string;
  };
}

export interface KarmicNumbers {
  karmic_debts: number[];
  karmic_lessons: number[];
  debt_meanings: string[];
  lesson_meanings: string[];
}

export interface PersonalYear {
  number: number;
  year: number;
  meaning: string;
}

export interface ChallengeNumbers {
  first_challenge: { number: number; period: string };
  second_challenge: { number: number; period: string };
  third_challenge: { number: number; period: string };
  fourth_challenge: { number: number; period: string };
  meanings: {
    first: string;
    second: string;
    third: string;
    fourth: string;
  };
}

export interface PinnacleNumbers {
  first_pinnacle: { number: number; period: string };
  second_pinnacle: { number: number; period: string };
  third_pinnacle: { number: number; period: string };
  fourth_pinnacle: { number: number; period: string };
  meanings: {
    first: string;
    second: string;
    third: string;
    fourth: string;
  };
}

export interface Systems {
  pythagorean: {
    system: string;
    letter_values: Record<string, string[]>;
    total_value: number;
    characteristics: string[];
  };
  chaldean: {
    system: string;
    letter_values: Record<string, string[]>;
    total_value: number;
    chaldean_number: number;
    meaning: string;
  };
}

export interface Interpretation {
  life_purpose: string;
  personality_overview: string;
  current_focus: string;
  spiritual_path: string;
}

export interface NumerologyResult {
  core_numbers: CoreNumbers;
  karmic_numbers: KarmicNumbers;
  personal_year: PersonalYear;
  challenge_numbers: ChallengeNumbers;
  pinnacle_numbers: PinnacleNumbers;
  systems: Systems;
  interpretation: Interpretation;
}
