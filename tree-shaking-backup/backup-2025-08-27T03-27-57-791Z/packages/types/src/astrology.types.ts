  sign: string;
  degree: number;
  position: number;
  house: string;
  retrograde?: boolean;
  aspects?: Aspect[];
}

  number: number;
  sign: string;
  degree: number;
  cusp: number;
  ruler: string;
}

  planet2: string;
  type: string;
  orb: number;
  applying: string;
}

  sign: string;
  degree: number;
  house: string;
}

  sign: string;
  degree: number;
  position: number;
}

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

  destiny: number;
  personalYear: number;
}
