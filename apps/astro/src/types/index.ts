export interface BirthData {
  date: string;
  time: string;
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  datetime: string;
}

export interface ChartData {
  planets: Record<string, {
    position: number;
    house: number;
    retrograde?: boolean;
    speed?: number;
  }>;
  houses: Array<{
    house: number;
    cusp: number;
    sign: string;
  }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}

export interface TransitData {
  birth_data: BirthData;
  start_date: string;
  end_date: string;
  orb?: number;
  include_retrogrades?: boolean;
}