// src/lib/images.ts
// Centralized image registry. Put your pngs in: ReArm - Luxury High-Tech Prosthetics_files/assets/

/** Catalog / Configurator families */
import HL_FAMILY from '../assets/hl-family.png';
import RL_FAMILY from '../assets/rl-family.png';
import SL_FAMILY from '../assets/sl-family.png';

/** Series + Generation previews */
import HL_G1 from '../assets/hl-g1.png';
import HL_G2 from '../assets/hl-g2.png';
import HL_G3 from '../assets/hl-g3.png';
import RL_G1 from '../assets/rl-g1.png';
import RL_G2 from '../assets/rl-g2.png';
import SL_G2 from '../assets/sl-g2.png';
import SL_G3 from '../assets/sl-g3.png';

/** Site heroes */
import HERO_HOME from '../assets/hero-home.png';
import HERO_FUTURE from '../assets/hero-future.png';
import HERO_ENGINEERING from '../assets/hero-engineering.png';

/** Home gallery */
import HOME_G1 from '../assets/gallery-home-1.png';
import HOME_G2 from '../assets/gallery-home-2.png';
import HOME_G3 from '../assets/gallery-home-3.png';
import HOME_G4 from '../assets/gallery-home-4.png';

/** Engineering page gallery */
import ENG_LAB1 from '../assets/engineering-lab-1.png';
import ENG_LAB2 from '../assets/engineering-lab-2.png';
import ENG_LAB3 from '../assets/engineering-lab-3.png';

/** Booking */
import CLINIC_BG from '../assets/clinic-bg.png';

export const CARD_IMAGE = {
  HL: HL_FAMILY,
  RL: RL_FAMILY,
  SL: SL_FAMILY,
} as const;

export const PREVIEW_IMAGE: Record<string, string> = {
  'HL-1': HL_G1,
  'HL-2': HL_G2,
  'HL-3': HL_G3,
  'RL-1': RL_G1,
  'RL-2': RL_G2,
  'SL-2': SL_G2,
  'SL-3': SL_G3,
};

export const HERO = {
  home: HERO_HOME,
  future: HERO_FUTURE,
  engineering: HERO_ENGINEERING,
};

export const HOME_GALLERY = [HOME_G1, HOME_G2, HOME_G3, HOME_G4];

export const ENGINEERING = {
  lab1: ENG_LAB1,
  lab2: ENG_LAB2,
  lab3: ENG_LAB3,
};

export const BOOKING = {
  clinicBg: CLINIC_BG,
};
