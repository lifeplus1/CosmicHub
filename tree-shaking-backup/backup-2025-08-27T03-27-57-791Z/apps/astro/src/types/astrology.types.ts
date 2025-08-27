// apps/astro/src/types/astrology.types.ts

  sign: string;
  house: number;
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

  sign: string;
  house: number;
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

  sign: string;
  degree: number;
}

  sign: string;
  cusp: number;
  planets: string[];
}

  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

  asteroids: AsteroidData[];
  angles: AngleData[];
  houses: HouseData[];
  aspects: AspectData[];
}
