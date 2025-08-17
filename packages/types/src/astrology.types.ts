export interface Planet {
  name: string;
  sign: string;
  degree: number;
  position: number;
  house: string;
  retrograde?: boolean;
  aspects?: Aspect[];
}

export interface House {
  house: number;
  number: number;
  sign: string;
  degree: number;
  cusp: number;
  ruler: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: string;
}

export interface Asteroid {
    name: string;
    sign: string;
    degree: number;
    house: string;
}

export interface Angle {
    name: string;
    sign: string;
    degree: number;
    position: number;
}

export interface AstrologyChart {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  asteroids: Asteroid[];
  angles: Angle[];
}

export interface UserProfile {
  userId: string;
  birthData: {
    date: string;
    time: string;
    location: string;
  };
}

export interface NumerologyData {
  lifePath: number;
  destiny: number;
  personalYear: number;
}
