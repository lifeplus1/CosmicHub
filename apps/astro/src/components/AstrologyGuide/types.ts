import type React from 'react';

export interface Fundamental {
  title: string;
  icon: React.ElementType;
  description: string;
  details: string[];
}

export interface Sign {
  name: string;
  element: string;
  modality: string;
  traits: string;
}

export interface Planet {
  name: string;
  symbol: string;
  meaning: string;
}

export interface House {
  number: number;
  area: string;
}

export interface Aspect {
  name: string;
  symbol: string;
  degree: number;
  nature: string;
  description: string;
}