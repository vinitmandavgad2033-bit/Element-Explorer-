export interface Isotope {
  symbol: string;
  mass: number;
  abundance: string; // e.g. "98.9%" or "trace"
  half_life: string | null;
  decay_mode: string | null;
  uses: string | null;
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  category: string;
  group: number | null;
  period: number;
  phase: string;
  electron_configuration: string;
  oxidation_states: string | null;
  block: string;
  melt: number | null; // Kelvin
  boil: number | null; // Kelvin
  density: number | null; // g/cm3
  discovered_by: string | null;
  year_discovered: string | number | null;
  uses: string | null;
  xpos: number;
  ypos: number;
  summary: string;
  isotopes?: Isotope[];
  // Physical properties
  thermal_conductivity?: number; // W/(m·K)
  electrical_conductivity?: number; // MS/m
  crystal_structure?: string;
  appearance?: string;
  // Chemical properties
  electronegativity?: number; // Pauling scale
  ionization_energy?: number; // kJ/mol
  typical_compounds?: string[];
  reactivity?: string;
}

export type ElementCategory = 
  | "diatomic nonmetal"
  | "noble gas"
  | "alkali metal"
  | "alkaline earth metal"
  | "metalloid"
  | "polyatomic nonmetal"
  | "post-transition metal"
  | "transition metal"
  | "lanthanide"
  | "actinide"
  | "unknown, probably transition metal"
  | "unknown, probably post-transition metal"
  | "unknown, probably metalloid"
  | "unknown, probably noble gas";
