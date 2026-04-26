import { useState, useMemo, useEffect, useCallback } from 'react';
import { STAFF_CONTACTS } from '../lib/coachData';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const C = {
  bg: '#ffffff', bg2: '#f9fafb', bg3: '#f3f4f6',
  blue: '#eff6ff', blueText: '#1d4ed8', blueBorder: '#93c5fd',
  green: '#f0fdf4', greenText: '#166534', greenBorder: '#86efac',
  yellow: '#fffbeb', yellowText: '#92400e', yellowBorder: '#fcd34d',
  red: '#fef2f2', redText: '#991b1b', redBorder: '#fca5a5',
  border: '#e5e7eb', border2: '#d1d5db',
  text: '#111827', text2: '#6b7280', text3: '#9ca3af',
  radius: '8px', radiusSm: '6px',
};

const card = { background: C.bg, borderRadius: C.radius, border: `1px solid ${C.border}`, padding: '1rem 1.25rem' };
const pill = (bg, color, border) => ({ background: bg, color, border: `1px solid ${border}`, fontSize: 11, padding: '2px 8px', borderRadius: C.radiusSm, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' });
const inputStyle = { width: '100%', marginTop: 4, padding: '7px 10px', borderRadius: C.radiusSm, border: `1px solid ${C.border2}`, fontSize: 13, background: C.bg, color: C.text, boxSizing: 'border-box' };

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = { Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function firstName(n) { const p = n.split(', '); return p.length > 1 ? p[1].split(' ')[0] : n; }
function initials(n) { const p = n.split(', '); return (p[1]?.[0] || '') + (p[0]?.[0] || ''); }
function shortName(n) { const p = n.split(', '); return p.length > 1 ? `${p[1].split(' ')[0]} ${p[0][0]}.` : n; }
function formatPhone(raw) {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : raw;
}

// ─── SCHEDULE DATA ───────────────────────────────────────────────────────────

const RAW_SCHEDULE = [
  { name: 'Bryan, Julia', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Ninja Five' },
  { name: 'Bryan, Julia', day: 'Monday', time: '6:30PM - 7:20PM', cls: 'Advanced Purple/Orange' },
  { name: 'Bryan, Julia', day: 'Monday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Bryan, Julia', day: 'Wednesday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Bryan, Julia', day: 'Friday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Bryan, Julia', day: 'Tuesday', time: '3:30PM - 4:00PM', cls: 'Wee Peas' },
  { name: 'Bryan, Julia', day: 'Wednesday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Bryan, Julia', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Ninja Green' },
  { name: 'Bryan, Julia', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Ninja Five' },
  { name: 'Bryan, Julia', day: 'Friday', time: '9:15AM - 9:45AM', cls: 'Two Pea' },
  { name: 'Bryan, Julia', day: 'Friday', time: '10:30AM - 11:00AM', cls: 'Wee Peas' },
  { name: 'Bryan, Julia', day: 'Friday', time: '11:15AM - 12:00PM', cls: 'Three Pea' },
  { name: 'Bryan, Julia', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Advanced Purple/Orange' },
  { name: 'Bryan, Julia', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Ninja Yellow' },
  { name: 'Bryan, Julia', day: 'Saturday', time: '10:30AM - 11:15AM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Bryan, Julia', day: 'Saturday', time: '11:30AM - 12:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Cox, Monica', day: 'Monday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Cox, Monica', day: 'Thursday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Dacoco, Jenna', day: 'Sunday', time: '9:30AM - 10:20AM', cls: 'Advanced Purple/Orange' },
  { name: 'Dacoco, Jenna', day: 'Sunday', time: '10:30AM - 11:20AM', cls: 'Beginner Yellow' },
  { name: 'Dacoco, Jenna', day: 'Sunday', time: '11:30AM - 12:20PM', cls: 'Intermediate Blue' },
  { name: 'Dacoco, Jenna', day: 'Sunday', time: '12:30PM - 1:20PM', cls: 'Beginner White' },
  { name: 'Daza, Lessly', day: 'Tuesday', time: '4:30PM - 5:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Daza, Lessly', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Ninja White' },
  { name: 'Daza, Lessly', day: 'Tuesday', time: '6:30PM - 7:20PM', cls: 'Ninja Five' },
  { name: 'Daza, Lessly', day: 'Wednesday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Daza, Lessly', day: 'Wednesday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Daza, Lessly', day: 'Friday', time: '4:30PM - 5:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Daza, Lessly', day: 'Friday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Daza, Lessly', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Ninja White' },
  { name: 'Dorwelo, Ian Don', day: 'Sunday', time: '8:50AM - 9:20AM', cls: 'Two Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Sunday', time: '9:30AM - 10:15AM', cls: 'Four Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Sunday', time: '10:30AM - 11:20AM', cls: 'Ninja Five' },
  { name: 'Dorwelo, Ian Don', day: 'Sunday', time: '11:30AM - 12:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Dorwelo, Ian Don', day: 'Sunday', time: '12:30PM - 1:20PM', cls: 'Beginner Yellow' },
  { name: 'Dorwelo, Ian Don', day: 'Monday', time: '4:30PM - 5:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Dorwelo, Ian Don', day: 'Monday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Dorwelo, Ian Don', day: 'Tuesday', time: '4:30PM - 5:15PM', cls: 'Three Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Tuesday', time: '5:30PM - 6:15PM', cls: 'Four Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Tuesday', time: '6:30PM - 7:00PM', cls: 'Two Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Five Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Wednesday', time: '5:30PM - 6:20PM', cls: 'Ninja White' },
  { name: 'Dorwelo, Ian Don', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Beginner White' },
  { name: 'Dorwelo, Ian Don', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Five Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Saturday', time: '10:30AM - 11:15AM', cls: 'Four Pea' },
  { name: 'Dorwelo, Ian Don', day: 'Saturday', time: '11:30AM - 12:20PM', cls: 'Ninja Five' },
  { name: 'Dorwelo, Ian Don', day: 'Saturday', time: '12:30PM - 1:20PM', cls: 'Beginner White' },
  { name: 'Douden, Grace', day: 'Sunday', time: '9:30AM - 10:20AM', cls: 'Intermediate Green' },
  { name: 'Douden, Grace', day: 'Sunday', time: '10:30AM - 11:20AM', cls: 'Five Pea' },
  { name: 'Douden, Grace', day: 'Sunday', time: '11:30AM - 12:20PM', cls: 'Ninja Five' },
  { name: 'Douden, Grace', day: 'Sunday', time: '12:30PM - 1:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Douden, Grace', day: 'Tuesday', time: '4:00PM - 4:50PM', cls: 'Intermediate Green' },
  { name: 'Douden, Grace', day: 'Tuesday', time: '5:00PM - 5:50PM', cls: 'Advanced Purple/Orange' },
  { name: 'Douden, Grace', day: 'Tuesday', time: '6:00PM - 6:50PM', cls: 'Tumbling and Trampoline' },
  { name: 'Douden, Grace', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Douden, Grace', day: 'Friday', time: '4:30PM - 5:15PM', cls: 'Three Pea' },
  { name: 'Douden, Grace', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Douden, Grace', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Intermediate Green' },
  { name: 'Douden, Grace', day: 'Friday', time: '7:30PM - 8:20PM', cls: 'Tumbling and Trampoline' },
  { name: 'Esquivas, Mariana', day: 'Sunday', time: '9:30AM - 10:20AM', cls: 'Ninja White' },
  { name: 'Esquivas, Mariana', day: 'Sunday', time: '10:30AM - 11:20AM', cls: 'Beginner White' },
  { name: 'Esquivas, Mariana', day: 'Sunday', time: '11:30AM - 12:20PM', cls: 'Beginner White' },
  { name: 'Esquivas, Mariana', day: 'Sunday', time: '12:30PM - 1:20PM', cls: 'Beginner White' },
  { name: 'Esquivas, Mariana', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Five Pea' },
  { name: 'Esquivas, Mariana', day: 'Monday', time: '6:30PM - 7:20PM', cls: 'Beginner White' },
  { name: 'Esquivas, Mariana', day: 'Wednesday', time: '3:30PM - 4:20PM', cls: 'Beginner White' },
  { name: 'Esquivas, Mariana', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Beginner Yellow' },
  { name: 'Esquivas, Mariana', day: 'Wednesday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Esquivas, Mariana', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Beginner Yellow' },
  { name: 'Esquivas, Mariana', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Ninja White' },
  { name: 'Esquivas, Mariana', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Ninja Five' },
  { name: 'Esquivas, Mariana', day: 'Thursday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Esquivas, Mariana', day: 'Thursday', time: '6:30PM - 7:20PM', cls: 'Five Pea' },
  { name: 'Esquivas, Mariana', day: 'Saturday', time: '9:45AM - 10:35AM', cls: 'Beginner Yellow' },
  { name: 'Esquivas, Mariana', day: 'Saturday', time: '10:50AM - 11:35AM', cls: 'Three Pea' },
  { name: 'Esquivas, Mariana', day: 'Saturday', time: '11:45AM - 12:35PM', cls: 'Beginner White' },
  { name: 'Geronimo, Miguel', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Beginner White' },
  { name: 'Geronimo, Miguel', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Ninja Five' },
  { name: 'Geronimo, Miguel', day: 'Monday', time: '6:30PM - 7:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Tuesday', time: '3:30PM - 4:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Ninja Blue' },
  { name: 'Geronimo, Miguel', day: 'Tuesday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Geronimo, Miguel', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Wednesday', time: '5:30PM - 6:20PM', cls: 'Ninja Five' },
  { name: 'Geronimo, Miguel', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Ninja Blue' },
  { name: 'Geronimo, Miguel', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Ninja Green' },
  { name: 'Geronimo, Miguel', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Ninja White' },
  { name: 'Geronimo, Miguel', day: 'Thursday', time: '6:30PM - 7:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Ninja Yellow' },
  { name: 'Geronimo, Miguel', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Ninja White' },
  { name: 'Geronimo, Miguel', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Ninja White' },
  { name: 'Geronimo, Miguel', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Ninja Green' },
  { name: 'Geronimo, Miguel', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Ninja Five' },
  { name: 'Geronimo, Miguel', day: 'Saturday', time: '10:30AM - 11:20AM', cls: 'Ninja White' },
  { name: 'Geronimo, Miguel', day: 'Saturday', time: '11:30AM - 12:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Gould, Miriam', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Aerial Silks Beginner White' },
  { name: 'Gould, Miriam', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Aerial Silks Intermediate Yellow' },
  { name: 'Gould, Miriam', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Aerial Silks Advanced Green' },
  { name: 'Gould, Miriam', day: 'Monday', time: '6:50PM - 7:50PM', cls: 'Aerial Silks Performance' },
  { name: 'Gould, Miriam', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Aerial Silks Advanced Green' },
  { name: 'Gould, Miriam', day: 'Wednesday', time: '7:30PM - 8:20PM', cls: 'Aerial Silks Beginner White Adult' },
  { name: 'Gould, Miriam', day: 'Thursday', time: '6:00PM - 6:50PM', cls: 'Aerial Silks Intermediate Yellow' },
  { name: 'Le, Nick', day: 'Sunday', time: '9:30AM - 10:15AM', cls: 'Three Pea' },
  { name: 'Le, Nick', day: 'Sunday', time: '10:30AM - 11:15AM', cls: 'Four Pea' },
  { name: 'Le, Nick', day: 'Sunday', time: '11:30AM - 12:20PM', cls: 'Intermediate Green' },
  { name: 'Le, Nick', day: 'Sunday', time: '12:30PM - 1:20PM', cls: 'Ninja White' },
  { name: 'Le, Nick', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Intermediate Green' },
  { name: 'Le, Nick', day: 'Saturday', time: '10:30AM - 11:20AM', cls: 'Ninja Five' },
  { name: 'Le, Nick', day: 'Saturday', time: '11:30AM - 12:20PM', cls: 'Ninja White' },
  { name: 'Le, Nick', day: 'Saturday', time: '12:30PM - 1:20PM', cls: 'Intermediate Blue' },
  { name: 'Legrande, Lawrence', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Legrande, Lawrence', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Ninja White' },
  { name: 'Legrande, Lawrence', day: 'Monday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Legrande, Lawrence', day: 'Monday', time: '6:30PM - 7:00PM', cls: 'Two Pea' },
  { name: 'Legrande, Lawrence', day: 'Wednesday', time: '3:30PM - 4:20PM', cls: 'Beginner White' },
  { name: 'Legrande, Lawrence', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Ninja White' },
  { name: 'Legrande, Lawrence', day: 'Wednesday', time: '5:30PM - 6:15PM', cls: 'Four Pea' },
  { name: 'Legrande, Lawrence', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Ninja White' },
  { name: 'Legrande, Lawrence', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Legrande, Lawrence', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Beginner White' },
  { name: 'Legrande, Lawrence', day: 'Thursday', time: '5:30PM - 6:00PM', cls: 'Two Pea' },
  { name: 'Legrande, Lawrence', day: 'Thursday', time: '6:30PM - 7:20PM', cls: 'Ninja White' },
  { name: 'Legrande, Lawrence', day: 'Friday', time: '4:30PM - 5:15PM', cls: 'Four Pea' },
  { name: 'Legrande, Lawrence', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Five Pea' },
  { name: 'Legrande, Lawrence', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Ninja Yellow' },
  { name: 'Legrande, Lawrence', day: 'Saturday', time: '9:00AM - 9:30AM', cls: 'One Pea' },
  { name: 'Legrande, Lawrence', day: 'Saturday', time: '10:00AM - 10:30AM', cls: 'Two Pea' },
  { name: 'Legrande, Lawrence', day: 'Saturday', time: '10:30AM - 11:15AM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Legrande, Lawrence', day: 'Saturday', time: '11:30AM - 12:20PM', cls: 'Beginner Yellow' },
  { name: 'Legrande, Lawrence', day: 'Saturday', time: '12:30PM - 1:20PM', cls: 'Ninja White' },
  { name: 'Leung, Tiffany', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Beginner White' },
  { name: 'Leung, Tiffany', day: 'Thursday', time: '4:30PM - 5:15PM', cls: 'Three Pea' },
  { name: 'Leung, Tiffany', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Intermediate Green' },
  { name: 'Leung, Tiffany', day: 'Thursday', time: '6:30PM - 7:20PM', cls: 'Intermediate Green' },
  { name: 'Leung, Tiffany', day: 'Saturday', time: '9:30AM - 10:20AM', cls: 'Beginner White' },
  { name: 'Leung, Tiffany', day: 'Saturday', time: '10:30AM - 11:20AM', cls: 'Beginner Yellow' },
  { name: 'Leung, Tiffany', day: 'Saturday', time: '11:30AM - 12:15PM', cls: 'Three Pea' },
  { name: 'Leung, Tiffany', day: 'Saturday', time: '12:30PM - 1:20PM', cls: 'Beginner Yellow' },
  { name: 'Martinez, Shella', day: 'Monday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Martinez, Shella', day: 'Thursday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Medina, Michael', day: 'Sunday', time: '9:30AM - 10:20AM', cls: 'Ninja Five' },
  { name: 'Medina, Michael', day: 'Sunday', time: '10:30AM - 11:15AM', cls: 'Three Pea' },
  { name: 'Medina, Michael', day: 'Sunday', time: '11:30AM - 12:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Medina, Michael', day: 'Sunday', time: '12:30PM - 1:20PM', cls: 'Five Pea' },
  { name: 'Medina, Michael', day: 'Saturday', time: '9:45AM - 10:35AM', cls: 'Ninja White' },
  { name: 'Medina, Michael', day: 'Saturday', time: '10:45AM - 11:35AM', cls: 'Ninja Yellow' },
  { name: 'Mehndiratta, Bhavika', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Beginner Yellow' },
  { name: 'Mehndiratta, Bhavika', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Mehndiratta, Bhavika', day: 'Monday', time: '6:30PM - 7:20PM', cls: 'Intermediate Green' },
  { name: 'Miller, Sierra', day: 'Monday', time: '9:30AM - 10:00AM', cls: 'Two Pea' },
  { name: 'Miller, Sierra', day: 'Monday', time: '10:15AM - 11:00AM', cls: 'Three Pea' },
  { name: 'Miller, Sierra', day: 'Monday', time: '11:15AM - 12:00PM', cls: 'Four Pea' },
  { name: 'Miller, Sierra', day: 'Monday', time: '4:30PM - 5:15PM', cls: 'Three Pea' },
  { name: 'Miller, Sierra', day: 'Monday', time: '5:30PM - 6:15PM', cls: 'Three Pea' },
  { name: 'Miller, Sierra', day: 'Tuesday', time: '3:30PM - 4:30PM', cls: 'Future Team - Butterflies' },
  { name: 'Miller, Sierra', day: 'Tuesday', time: '4:30PM - 5:15PM', cls: 'Four Pea' },
  { name: 'Miller, Sierra', day: 'Tuesday', time: '5:30PM - 6:15PM', cls: 'Three Pea' },
  { name: 'Miller, Sierra', day: 'Wednesday', time: '6:30PM - 7:00PM', cls: 'Two Pea' },
  { name: 'Miller, Sierra', day: 'Thursday', time: '3:30PM - 4:30PM', cls: 'Future Team - Butterflies' },
  { name: 'Miller, Sierra', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Beginner Yellow' },
  { name: 'Miller, Sierra', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Five Pea' },
  { name: 'Miller, Sierra', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Five Pea' },
  { name: 'Miller, Sierra', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Beginner White' },
  { name: 'Miller, Sierra', day: 'Saturday', time: '8:30AM - 9:00AM', cls: 'Two Pea' },
  { name: 'Miller, Sierra', day: 'Saturday', time: '9:00AM - 9:30AM', cls: 'Wee Peas' },
  { name: 'Miller, Sierra', day: 'Saturday', time: '9:30AM - 10:15AM', cls: 'Three Pea' },
  { name: 'Miller, Sierra', day: 'Saturday', time: '10:30AM - 11:00AM', cls: 'Two Pea' },
  { name: 'Miller, Sierra', day: 'Saturday', time: '11:00AM - 11:30AM', cls: 'Two Pea' },
  { name: 'Nandanwar, Sahana', day: 'Saturday', time: '9:50AM - 10:35AM', cls: 'Three Pea' },
  { name: 'Nandanwar, Sahana', day: 'Saturday', time: '10:45AM - 11:35AM', cls: 'Beginner White' },
  { name: 'Nandanwar, Sahana', day: 'Saturday', time: '11:45AM - 12:35PM', cls: 'Intermediate Green' },
  { name: 'Nandanwar, Sahana', day: 'Saturday', time: '12:45PM - 1:35PM', cls: 'Intermediate Green' },
  { name: 'Nelms, Justine', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Five Pea' },
  { name: 'Nelms, Justine', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Intermediate Green' },
  { name: 'Nelms, Justine', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Beginner White' },
  { name: 'Nelms, Justine', day: 'Wednesday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Ong, Alicia', day: 'Sunday', time: '9:30AM - 10:20AM', cls: 'Aerial Silks Beginner White' },
  { name: 'Ong, Alicia', day: 'Sunday', time: '10:30AM - 11:20AM', cls: 'Aerial Silks Beginner White' },
  { name: 'Pacheco, Jenevieve', day: 'Saturday', time: '9:30AM - 10:15AM', cls: 'Four Pea' },
  { name: 'Pacheco, Jenevieve', day: 'Saturday', time: '10:30AM - 11:15AM', cls: 'Three Pea' },
  { name: 'Phair, Anika', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Aerial Silks Beginner White' },
  { name: 'Pichardo, Jocelin', day: 'Tuesday', time: '3:30PM - 4:20PM', cls: 'Ninja White' },
  { name: 'Pichardo, Jocelin', day: 'Tuesday', time: '4:30PM - 5:20PM', cls: 'Beginner Yellow' },
  { name: 'Pichardo, Jocelin', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Pichardo, Jocelin', day: 'Tuesday', time: '6:30PM - 7:20PM', cls: 'Beginner Yellow' },
  { name: 'Pichardo, Jocelin', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Beginner White' },
  { name: 'Pichardo, Jocelin', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Beginner Yellow' },
  { name: 'Pichardo, Jocelin', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Pichardo, Jocelin', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Beginner White' },
  { name: 'Porter, Ashley', day: 'Monday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Porter, Ashley', day: 'Thursday', time: '4:00PM - 6:00PM', cls: 'Future Team - Fireflies' },
  { name: 'Porter, Ashley', day: 'Monday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Porter, Ashley', day: 'Wednesday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Porter, Ashley', day: 'Friday', time: '4:30PM - 6:30PM', cls: 'Future Team - Dragonflies' },
  { name: 'Salas, Briana', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Aerial Silks Beginner White' },
  { name: 'Salas, Briana', day: 'Monday', time: '4:30PM - 5:15PM', cls: 'Four Pea' },
  { name: 'Salas, Briana', day: 'Monday', time: '5:30PM - 6:15PM', cls: 'Four Pea' },
  { name: 'Salas, Briana', day: 'Monday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Salas, Briana', day: 'Tuesday', time: '4:30PM - 5:20PM', cls: 'Five Pea' },
  { name: 'Salas, Briana', day: 'Tuesday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Salas, Briana', day: 'Wednesday', time: '5:30PM - 6:20PM', cls: 'Five Pea' },
  { name: 'Salas, Briana', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Five Pea' },
  { name: 'Salas, Briana', day: 'Friday', time: '6:30PM - 7:15PM', cls: 'Three Pea' },
  { name: 'Salas, Briana', day: 'Saturday', time: '10:30AM - 11:20AM', cls: 'Five Pea' },
  { name: 'Salas, Briana', day: 'Saturday', time: '11:30AM - 12:15PM', cls: 'Four Pea' },
  { name: 'Saxena, Ashir', day: 'Tuesday', time: '4:30PM - 5:20PM', cls: 'Ninja White' },
  { name: 'Saxena, Ashir', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Ninja Five' },
  { name: 'Saxena, Ashir', day: 'Tuesday', time: '6:30PM - 7:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Templeton, Sophia', day: 'Monday', time: '3:30PM - 4:20PM', cls: 'Intermediate Green' },
  { name: 'Templeton, Sophia', day: 'Monday', time: '4:30PM - 5:20PM', cls: 'Beginner White' },
  { name: 'Templeton, Sophia', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Templeton, Sophia', day: 'Tuesday', time: '3:30PM - 4:20PM', cls: 'Intermediate Green' },
  { name: 'Templeton, Sophia', day: 'Tuesday', time: '4:30PM - 5:20PM', cls: 'Intermediate Blue' },
  { name: 'Templeton, Sophia', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Templeton, Sophia', day: 'Tuesday', time: '6:30PM - 7:20PM', cls: 'Intermediate Blue' },
  { name: 'Templeton, Sophia', day: 'Wednesday', time: '3:30PM - 4:20PM', cls: 'Intermediate Green' },
  { name: 'Templeton, Sophia', day: 'Wednesday', time: '4:30PM - 5:20PM', cls: 'Ninja Five' },
  { name: 'Templeton, Sophia', day: 'Wednesday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Templeton, Sophia', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Intermediate Blue' },
  { name: 'Templeton, Sophia', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Intermediate Blue' },
  { name: 'Templeton, Sophia', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Intermediate Green' },
  { name: 'Templeton, Sophia', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Templeton, Sophia', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Templeton, Sophia', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Ninja Five' },
  { name: 'Templeton, Sophia', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Intermediate Blue' },
  { name: 'Templeton, Sophia', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Advanced Purple/Orange' },
  { name: 'Templeton, Sophia', day: 'Friday', time: '7:30PM - 8:20PM', cls: 'Tumbling and Trampoline' },
  { name: 'Valdovinos, Andrea', day: 'Thursday', time: '4:30PM - 5:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Valdovinos, Andrea', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Ninja Five' },
  { name: 'Valdovinos, Andrea', day: 'Thursday', time: '6:30PM - 7:15PM', cls: 'Three Pea' },
  { name: 'Valdovinos, Cristian', day: 'Thursday', time: '3:30PM - 4:20PM', cls: 'Five Pea' },
  { name: 'Valdovinos, Cristian', day: 'Thursday', time: '4:30PM - 5:15PM', cls: 'Four Pea' },
  { name: 'Valdovinos, Cristian', day: 'Thursday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 3" },
  { name: 'Valdovinos, Cristian', day: 'Thursday', time: '6:30PM - 7:15PM', cls: 'Four Pea' },
  { name: 'Valdovinos, Cristian', day: 'Friday', time: '3:30PM - 4:20PM', cls: 'Ninja White' },
  { name: 'Valdovinos, Cristian', day: 'Friday', time: '4:30PM - 5:20PM', cls: 'Five Pea' },
  { name: 'Valdovinos, Cristian', day: 'Friday', time: '5:30PM - 6:15PM', cls: "Ninja - Lil' Ninja 4" },
  { name: 'Valdovinos, Cristian', day: 'Friday', time: '6:30PM - 7:15PM', cls: 'Four Pea' },
  { name: 'Yanez, Kalina', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Yanez, Kalina', day: 'Tuesday', time: '6:30PM - 7:20PM', cls: 'Beginner White' },
  { name: 'Yanez, Kalina', day: 'Wednesday', time: '3:30PM - 4:20PM', cls: 'Beginner Yellow' },
  { name: 'Yanez, Kalina', day: 'Wednesday', time: '4:30PM - 5:15PM', cls: 'Four Pea' },
  { name: 'Yanez, Kalina', day: 'Wednesday', time: '5:30PM - 6:15PM', cls: 'Three Pea' },
  { name: 'Yanez, Kalina', day: 'Wednesday', time: '6:30PM - 7:20PM', cls: 'Intermediate Green' },
  { name: 'Yee, Jasmine', day: 'Tuesday', time: '4:30PM - 5:20PM', cls: 'Beginner White' },
  { name: 'Yee, Jasmine', day: 'Tuesday', time: '5:30PM - 6:20PM', cls: 'Beginner White' },
  { name: 'Yee, Jasmine', day: 'Tuesday', time: '6:30PM - 7:20PM', cls: 'Intermediate Green' },
  { name: 'Yee, Jasmine', day: 'Friday', time: '5:30PM - 6:20PM', cls: 'Intermediate Green' },
  { name: 'Yee, Jasmine', day: 'Friday', time: '6:30PM - 7:20PM', cls: 'Beginner Yellow' },
  { name: 'Zamarripa, Liliana', day: 'Monday', time: '5:30PM - 6:20PM', cls: 'Ninja White' },
  { name: 'Zamarripa, Liliana', day: 'Monday', time: '6:30PM - 7:20PM', cls: 'Beginner Yellow' },
  { name: 'Zamarripa, Liliana', day: 'Thursday', time: '4:30PM - 5:20PM', cls: 'Five Pea' },
  { name: 'Zamarripa, Liliana', day: 'Thursday', time: '5:30PM - 6:20PM', cls: 'Beginner Yellow' },
  { name: 'Zamarripa, Liliana', day: 'Thursday', time: '6:30PM - 7:20PM', cls: 'Beginner White' },
];

// ─── COACH BUILDER ───────────────────────────────────────────────────────────

function buildCoaches(data) {
  const names = [...new Set(data.map(r => r.name))].sort();
  const daysMap = {}, clsMap = {};
  data.forEach(r => {
    if (!daysMap[r.name]) daysMap[r.name] = new Set();
    daysMap[r.name].add(r.day);
    if (!clsMap[r.name]) clsMap[r.name] = new Set();
    clsMap[r.name].add(r.cls);
  });
  return names.map((name, i) => ({
    id: i + 1, name,
    code: (firstName(name).slice(0, 3) + String(i + 1).padStart(2, '0')).toUpperCase(),
    availability: [...(daysMap[name] || [])].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
    classes: [...(clsMap[name] || [])],
  }));
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

function Avatar({ name, size = 34 }) {
  const bgs = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe'];
  const tcs = ['#1d4ed8', '#166534', '#92400e', '#9d174d', '#5b21b6'];
  const i = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % 5;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: bgs[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: tcs[i], flexShrink: 0 }}>{initials(name)}</div>;
}

function StatusBadge({ status }) {
  if (status === 'open') return <span style={pill(C.yellow, C.yellowText, C.yellowBorder)}>open</span>;
  if (status === 'claimed') return <span style={pill(C.blue, C.blueText, C.blueBorder)}>claimed</span>;
  return <span style={pill(C.green, C.greenText, C.greenBorder)}>confirmed</span>;
}

function Spinner() {
  return <div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('admin');
  const [adminTab, setAdminTab] = useState('calendar');
  const [shifts, setShifts] = useState([]);
  const [smsLog, setSmsLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [scheduleCoach, setScheduleCoach] = useState(null);
  const [findSubShift, setFindSubShift] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [coachCode, setCoachCode] = useState('');
  const [activeCoach, setActiveCoach] = useState(null);
  const [loginErr, setLoginErr] = useState('');
  const [coachTab, setCoachTab] = useState('open');
  const [printDay, setPrintDay] = useState(null);
  const [form, setForm] = useState({ instructorName: '', day: '', time: '', cls: '', notes: '' });
  const [availability, setAvailability] = useState(() => {
    const m = {}; buildCoaches(RAW_SCHEDULE).forEach(c => { m[c.id] = [...c.availability]; }); return m;
  });

  const coaches = useMemo(() => buildCoaches(RAW_SCHEDULE), []);
  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const baseDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + weekOffset * 7); return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    const m = {};
    DAY_ORDER.forEach((d, i) => {
      const dt = new Date(baseDate); dt.setDate(baseDate.getDate() + i);
      m[d] = dt.toISOString().slice(0, 10);
    });
    return m;
  }, [baseDate]);

  const fmtRange = () => {
    const end = new Date(baseDate); end.setDate(baseDate.getDate() + 6);
    return `${baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const instructorSchedule = useMemo(() => form.instructorName ? RAW_SCHEDULE.filter(r => r.name === form.instructorName) : [], [form.instructorName]);
  const availableDays = useMemo(() => [...new Set(instructorSchedule.map(r => r.day))].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)), [instructorSchedule]);
  const classesOnDay = useMemo(() => instructorSchedule.filter(r => r.day === form.day).map(r => ({ time: r.time, cls: r.cls })), [instructorSchedule, form.day]);

  const fetchShifts = useCallback(async () => {
    try {
      const res = await fetch('/api/shifts');
      const data = await res.json();
      if (res.ok) setShifts(data.map(s => ({
        id: s.id, instructorName: s.instructor_name, date: s.date,
        day: s.day, time: s.time, cls: s.cls, notes: s.notes,
        status: s.status, claimedBy: s.claimed_by_id, claimedByName: s.claimed_by_name,
      })));
    } catch (e) { console.error('Failed to fetch shifts', e); }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);
  useEffect(() => { const t = setInterval(fetchShifts, 30000); return () => clearInterval(t); }, [fetchShifts]);

  const postShift = async () => {
    if (!form.instructorName || !form.cls) return;
    setLoading(true); setError('');
    try {
      const di = DAY_ORDER.indexOf(form.day);
      const dt = new Date(baseDate); dt.setDate(baseDate.getDate() + di);
      const date = dt.toISOString().slice(0, 10);
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructor_name: form.instructorName, date, day: form.day, time: form.time, cls: form.cls, notes: form.notes }),
      });
      const shift = await res.json();
      if (!res.ok) throw new Error(shift.error);

      const eligible = coaches.filter(c => {
        if (c.name === form.instructorName) return false;
        if (!(availability[c.id] || []).includes(form.day)) return false;
        return !RAW_SCHEDULE.some(r => r.name === c.name && r.day === form.day && r.time === form.time);
      });

      if (eligible.length > 0) {
        const notifyRes = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shift_id: shift.id,
            coaches: eligible.map(c => {
              const ct = STAFF_CONTACTS[c.name] || {};
              return { name: c.name, phone: ct.phone || '', email: ct.email || '', code: c.code };
            }),
          }),
        });
        const nd = await notifyRes.json();
        setSmsLog(p => [...nd.results.map(r => ({ to: r.coach, success: r.success, time: new Date().toLocaleTimeString() })), ...p]);
      }
      await fetchShifts();
      setShowPost(false);
      setForm({ instructorName: '', day: '', time: '', cls: '', notes: '' });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const claimShift = async (shiftId) => {
    setLoading(true);
    try {
      await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shift_id: shiftId, action: 'claim', coach_id: activeCoach.id, coach_name: activeCoach.name }) });
      await fetchShifts();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const confirmShift = async (shiftId) => {
    setLoading(true);
    try {
      await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shift_id: shiftId, action: 'confirm' }) });
      await fetchShifts();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const removeShift = async (shiftId) => {
    try { await fetch(`/api/shifts?id=${shiftId}`, { method: 'DELETE' }); await fetchShifts(); }
    catch (e) { setError(e.message); }
  };

  const assignSub = async (shift, coach) => {
    setLoading(true);
    try {
      await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shift_id: shift.id, action: 'claim', coach_id: coach.id, coach_name: coach.name }) });
      await fetchShifts(); setFindSubShift(null);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const loginCoach = () => {
    const c = coaches.find(x => x.code === coachCode.toUpperCase().trim());
    if (c) { setActiveCoach(c); setLoginErr(''); } else setLoginErr('Code not found. Contact Johnny.');
  };

  const myShifts = activeCoach ? shifts.filter(s => s.claimedBy === activeCoach.id) : [];
  const openForMe = activeCoach ? shifts.filter(s => s.status === 'open' && (availability[activeCoach.id] || []).includes(s.day)) : [];
  const toggleDay = d => { if (!activeCoach) return; setAvailability(p => { const c = p[activeCoach.id] || []; return { ...p, [activeCoach.id]: c.includes(d) ? c.filter(x => x !== d) : [...c, d] }; }); };

  const getPrintData = day => {
    const date = weekDates[day];
    const dayShifts = shifts.filter(s => s.day === day && s.date === date);
    return RAW_SCHEDULE.filter(r => r.day === day).map(r => ({
      time: r.time, cls: r.cls, instructorName: r.name,
      contact: STAFF_CONTACTS[r.name] || {},
      subShift: dayShifts.find(s => s.instructorName === r.name),
    })).sort((a, b) => a.time.localeCompare(b.time));
  };

  const btn = (label, active, onClick, bg, tc, bc) => (
    <button onClick={onClick} style={{ background: active ? (bg || C.bg3) : 'transparent', color: active ? (tc || C.text) : C.text2, border: `1px solid ${active ? (bc || C.border2) : C.border}`, borderRadius: C.radiusSm, padding: '5px 14px', fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400 }}>{label}</button>
  );

  const Logo = () => (
    <svg width="80" height="52" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="65" rx="98" ry="62" fill="white" stroke="#222" strokeWidth="5" />
      {[[100,30],[100,42],[100,54],[100,66],[100,78],[100,90],[100,102]].map(([x,y],i) => <circle key={`b${i}`} cx={x} cy={y} r={i===3?7:5} fill="#29b6e8" opacity="0.9"/>)}
      {[[82,28],[70,22],[60,20],[72,34],[62,30],[52,28],[80,40],[68,38],[58,38],[76,50],[66,48]].map(([x,y],i) => <circle key={`ul${i}`} cx={x} cy={y} r={4} fill="#29b6e8" opacity="0.85"/>)}
      {[[118,28],[130,22],[140,20],[128,34],[138,30],[148,28],[120,40],[132,38],[142,38],[124,50],[134,48]].map(([x,y],i) => <circle key={`ur${i}`} cx={x} cy={y} r={4} fill="#29b6e8" opacity="0.85"/>)}
      {[[85,75],[75,82],[65,88],[78,90],[68,96]].map(([x,y],i) => <circle key={`ll${i}`} cx={x} cy={y} r={3} fill="#29b6e8" opacity="0.8"/>)}
      {[[115,75],[125,82],[135,88],[122,90],[132,96]].map(([x,y],i) => <circle key={`lr${i}`} cx={x} cy={y} r={3} fill="#29b6e8" opacity="0.8"/>)}
      <text x="30" y="88" fontFamily="Georgia,serif" fontSize="28" fontStyle="italic" fontWeight="bold" fill="#111" letterSpacing="-1">Bay Aerials</text>
      <text x="52" y="108" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="bold" fill="#111" letterSpacing="3">GYMNASTICS</text>
    </svg>
  );

  return (
    <div style={{ padding: '1rem', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: C.bg2, minHeight: '100vh', boxSizing: 'border-box' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* HEADER */}
      <div style={{ background: C.bg, borderRadius: C.radius, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <div style={{ fontSize: 12, color: C.text2 }}>Sub scheduler · {coaches.length} instructors · <span style={{ color: '#16a34a', fontWeight: 600 }}>LIVE</span></div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {view === 'admin' && <button onClick={() => setShowImport(true)} style={{ background: C.bg2, color: C.text2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>↑ Import</button>}
          <button onClick={() => setShowProtocol(true)} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>📋 Protocol</button>
          {btn('Admin', view === 'admin', () => setView('admin'))}
          {btn('Coach login', view === 'coach', () => setView('coach'))}
        </div>
      </div>

      {error && <div style={{ background: C.red, border: `1px solid ${C.redBorder}`, borderRadius: C.radiusSm, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: C.redText }}>{error} <button onClick={() => setError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.redText }}>✕</button></div>}

      {/* ADMIN */}
      {view === 'admin' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {[['Open', shifts.filter(s => s.status === 'open').length, C.yellow, C.yellowText, C.yellowBorder],
              ['Claimed', shifts.filter(s => s.status === 'claimed').length, C.blue, C.blueText, C.blueBorder],
              ['Confirmed', shifts.filter(s => s.status === 'confirmed').length, C.green, C.greenText, C.greenBorder]].map(([l, v, bg, tc, bc]) => (
              <div key={l} style={{ background: bg, border: `1px solid ${bc}`, borderRadius: C.radius, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: tc, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: tc }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {btn('📅 Calendar', adminTab === 'calendar', () => setAdminTab('calendar'))}
            {btn('📋 Shifts', adminTab === 'shifts', () => setAdminTab('shifts'))}
            {btn('👥 Roster', adminTab === 'roster', () => setAdminTab('roster'))}
            {btn('💬 SMS log', adminTab === 'sms', () => setAdminTab('sms'))}
            <button onClick={() => setShowPost(true)} style={{ marginLeft: 'auto', background: '#16a34a', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Post shift</button>
          </div>

          {/* CALENDAR */}
          {adminTab === 'calendar' && (
            <div style={{ background: C.bg, borderRadius: C.radius, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '4px 12px', cursor: 'pointer', fontSize: 16 }}>‹</button>
                <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>{fmtRange()}</div>
                <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '4px 12px', cursor: 'pointer', fontSize: 16 }}>›</button>
                {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>today</button>}
              </div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
                {DAY_ORDER.map(day => (
                  <button key={day} onClick={() => setPrintDay(printDay === day ? null : day)} style={{ background: printDay === day ? C.blue : C.bg2, border: `1px solid ${printDay === day ? C.blueBorder : C.border}`, color: printDay === day ? C.blueText : C.text2, borderRadius: C.radiusSm, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>🖨 {DAY_SHORT[day]}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6 }}>
                {DAY_ORDER.map(day => {
                  const date = weekDates[day];
                  const dayShifts = shifts.filter(s => s.day === day && s.date === date);
                  return (
                    <div key={day} style={{ minHeight: 90 }}>
                      <div style={{ textAlign: 'center', marginBottom: 5 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.text2, textTransform: 'uppercase' }}>{DAY_SHORT[day]}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{parseInt(date.split('-')[2])}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {dayShifts.length === 0
                          ? <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, fontSize: 9, color: C.text3, textAlign: 'center', minHeight: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</div>
                          : dayShifts.map(s => {
                            const [bg, tc, bc] = s.status === 'confirmed' ? [C.green, C.greenText, C.greenBorder] : s.status === 'claimed' ? [C.blue, C.blueText, C.blueBorder] : [C.yellow, C.yellowText, C.yellowBorder];
                            return (
                              <div key={s.id} onClick={() => s.status === 'open' && setFindSubShift(s)} style={{ background: bg, border: `1px solid ${bc}`, borderRadius: C.radiusSm, padding: '3px 5px', cursor: s.status === 'open' ? 'pointer' : 'default' }}>
                                <div style={{ fontSize: 9, fontWeight: 600, color: tc }}>{s.time.split(' - ')[0]}</div>
                                <div style={{ fontSize: 9, color: tc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.cls}</div>
                                <div style={{ fontSize: 8, color: tc, opacity: 0.8 }}>{s.claimedByName ? shortName(s.claimedByName) : 'open'}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: C.text2, flexWrap: 'wrap' }}>
                {[['open', C.yellow, C.yellowBorder], ['claimed', C.blue, C.blueBorder], ['confirmed', C.green, C.greenBorder]].map(([l, bg, bc]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1px solid ${bc}`, display: 'inline-block' }} />{l}</span>
                ))}
                <span>· tap open shift to find a sub</span>
              </div>
              {printDay && (() => {
                const rows = getPrintData(printDay);
                const date = weekDates[printDay];
                const dateStr = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                const lines = [`BAY AERIALS — ${printDay.toUpperCase()} SCHEDULE`, dateStr, '─'.repeat(56),
                  ...rows.map(r => {
                    const s = r.subShift; const subName = s?.claimedByName ? shortName(s.claimedByName) : null;
                    const sub = !s ? '' : s.status === 'confirmed' && subName ? `  ✓ SUB: ${subName}` : s.status === 'claimed' && subName ? `  SUB CLAIMED: ${subName}` : '  ⚠ OPEN — no sub yet';
                    return `${r.time.padEnd(24)}${r.cls.padEnd(36)}${shortName(r.instructorName).padEnd(18)}${sub}`;
                  }), '─'.repeat(56), `Bay Aerials Gymnastics · ${new Date().toLocaleString()}`].join('\n');
                return (
                  <div style={{ marginTop: 16, border: `1px solid ${C.blueBorder}`, borderRadius: C.radius, overflow: 'hidden' }}>
                    <div style={{ background: C.blue, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.blueText }}>📋 {printDay} · {dateStr}</div>
                      <button onClick={() => setPrintDay(null)} style={{ background: 'transparent', border: `1px solid ${C.blueBorder}`, borderRadius: C.radiusSm, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: C.blueText }}>✕</button>
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 12, color: C.text2, marginBottom: 8 }}>Click inside → <strong>Cmd+A</strong> or <strong>Ctrl+A</strong> to select all, then copy and paste.</div>
                      <textarea readOnly value={lines} onClick={e => e.target.select()} style={{ width: '100%', height: 280, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: 10, color: C.text, resize: 'vertical', boxSizing: 'border-box', whiteSpace: 'pre' }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SHIFTS */}
          {adminTab === 'shifts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shifts.length === 0 && <div style={{ ...card, textAlign: 'center', color: C.text2, padding: '2rem' }}>No shifts posted yet.</div>}
              {[...shifts].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(s => (
                <div key={s.id} style={{ ...card, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '6px 10px', textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{s.day}</div>
                    <div style={{ fontSize: 10, color: C.text2 }}>{s.date}</div>
                    <div style={{ fontSize: 10, color: C.text2 }}>{s.time.split(' - ')[0]}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.cls}</div>
                    <div style={{ fontSize: 12, color: C.text2 }}>covering {shortName(s.instructorName)}{s.notes ? ` · ${s.notes}` : ''}</div>
                    {s.claimedByName && <div style={{ fontSize: 12, color: C.blueText, fontWeight: 500, marginTop: 2 }}>→ {shortName(s.claimedByName)}</div>}
                  </div>
                  <StatusBadge status={s.status} />
                  {s.status === 'claimed' && <button onClick={() => confirmShift(s.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Confirm</button>}
                  {s.status === 'open' && <button onClick={() => setFindSubShift(s)} style={{ background: C.blue, color: C.blueText, border: `1px solid ${C.blueBorder}`, borderRadius: C.radiusSm, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Find sub</button>}
                  <button onClick={() => removeShift(s.id)} style={{ background: C.red, color: C.redText, border: `1px solid ${C.redBorder}`, borderRadius: C.radiusSm, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* ROSTER */}
          {adminTab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coaches.map(c => {
                const ct = STAFF_CONTACTS[c.name] || {}; const phone = formatPhone(ct.phone || '');
                return (
                  <div key={c.id} style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Avatar name={c.name} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{shortName(c.name)}</div>
                        <div style={{ fontSize: 11, color: C.text2 }}>Code: <strong style={{ color: C.blueText }}>{c.code}</strong></div>
                        {phone && <a href={`tel:${phone}`} style={{ fontSize: 11, color: C.blueText, textDecoration: 'none' }}>{phone}</a>}
                        {ct.email && <div><a href={`mailto:${ct.email}`} style={{ fontSize: 11, color: C.blueText, textDecoration: 'none' }}>{ct.email}</a></div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <button onClick={() => setScheduleCoach(c)} style={{ background: C.blue, color: C.blueText, border: `1px solid ${C.blueBorder}`, borderRadius: C.radiusSm, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>📅 Schedule</button>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {(availability[c.id] || c.availability).map(d => <span key={d} style={pill(C.blue, C.blueText, C.blueBorder)}>{DAY_SHORT[d]}</span>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.classes.slice(0, 5).map(cl => <span key={cl} style={pill(C.bg2, C.text2, C.border)}>{cl}</span>)}
                      {c.classes.length > 5 && <span style={pill(C.bg2, C.text2, C.border)}>+{c.classes.length - 5} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SMS LOG */}
          {adminTab === 'sms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {smsLog.length === 0 && <div style={{ ...card, textAlign: 'center', color: C.text2, padding: '2rem' }}>No messages yet.</div>}
              {smsLog.map((m, i) => (
                <div key={i} style={card}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{m.to}</span>
                    <span style={pill(m.success ? C.green : C.red, m.success ? C.greenText : C.redText, m.success ? C.greenBorder : C.redBorder)}>{m.success ? '✓ Sent' : '✗ Failed'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: C.text3 }}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COACH PORTAL */}
      {view === 'coach' && !activeCoach && (
        <div style={{ maxWidth: 320, margin: '0 auto', paddingTop: '1rem' }}>
          <div style={{ ...card, textAlign: 'center' }}>
            <Logo />
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, marginTop: 8 }}>Coach Portal</div>
            <div style={{ fontSize: 13, color: C.text2, marginBottom: 16 }}>Enter your personal code to view and claim open shifts.</div>
            <input value={coachCode} onChange={e => setCoachCode(e.target.value)} placeholder="e.g. JUL01" onKeyDown={e => e.key === 'Enter' && loginCoach()} style={{ ...inputStyle, textTransform: 'uppercase', textAlign: 'center', fontSize: 16, marginBottom: 8 }} />
            {loginErr && <div style={{ color: C.redText, fontSize: 13, marginBottom: 8 }}>{loginErr}</div>}
            <button onClick={loginCoach} style={{ width: '100%', padding: 9, background: '#2563eb', color: '#fff', border: 'none', borderRadius: C.radiusSm, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Log in</button>
            <div style={{ marginTop: 12, fontSize: 11, color: C.text3 }}>Contact Johnny if you need your code.</div>
          </div>
        </div>
      )}

      {view === 'coach' && activeCoach && (
        <div>
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={activeCoach.name} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{shortName(activeCoach.name)}</div>
              <div style={{ fontSize: 12, color: C.text2 }}>Coach portal</div>
            </div>
            <button onClick={() => { setActiveCoach(null); setCoachCode(''); }} style={{ background: C.bg2, color: C.text2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Log out</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {btn('Open shifts', coachTab === 'open', () => setCoachTab('open'), C.yellow, C.yellowText, C.yellowBorder)}
            {btn('My shifts', coachTab === 'mine', () => setCoachTab('mine'), C.blue, C.blueText, C.blueBorder)}
            {btn('Availability', coachTab === 'avail', () => setCoachTab('avail'), C.green, C.greenText, C.greenBorder)}
            <button onClick={() => setScheduleCoach(activeCoach)} style={{ background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd', borderRadius: C.radiusSm, padding: '5px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>📅 My Schedule</button>
          </div>
          {coachTab === 'open' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openForMe.length === 0 && <div style={{ ...card, textAlign: 'center', color: C.text2, padding: '2rem' }}>No open shifts match your available days right now.</div>}
              {openForMe.map(s => (
                <div key={s.id} style={card}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ background: C.yellow, border: `1px solid ${C.yellowBorder}`, borderRadius: C.radiusSm, padding: '6px 12px', textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.yellowText }}>{s.day}</div>
                      <div style={{ fontSize: 10, color: C.yellowText }}>{s.time.split(' - ')[0]}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{s.cls}</div>
                      <div style={{ fontSize: 12, color: C.text2 }}>covering {shortName(s.instructorName)}</div>
                    </div>
                    <button onClick={() => claimShift(s.id)} disabled={loading} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '7px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {loading ? <Spinner /> : null}Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {coachTab === 'mine' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myShifts.length === 0 && <div style={{ ...card, textAlign: 'center', color: C.text2, padding: '2rem' }}>No shifts claimed yet.</div>}
              {myShifts.map(s => (
                <div key={s.id} style={{ ...card, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 80 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{s.day}</div><div style={{ fontSize: 11, color: C.text2 }}>{s.time}</div><div style={{ fontSize: 11, color: C.text2 }}>{s.date}</div></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.cls}</div><div style={{ fontSize: 11, color: C.text2 }}>covering {shortName(s.instructorName)}</div></div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
          {coachTab === 'avail' && (
            <div style={card}>
              <div style={{ fontSize: 13, color: C.text2, marginBottom: 12 }}>Tap days you're available.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DAY_ORDER.map(d => { const on = (availability[activeCoach.id] || []).includes(d); return <button key={d} onClick={() => toggleDay(d)} style={{ padding: '8px 14px', borderRadius: C.radiusSm, border: `1px solid ${on ? C.blueBorder : C.border}`, background: on ? C.blue : 'transparent', color: on ? C.blueText : C.text2, fontWeight: on ? 600 : 400, cursor: 'pointer', fontSize: 13 }}>{DAY_SHORT[d]}</button>; })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COACH SCHEDULE MODAL */}
      {scheduleCoach && (() => {
        const ct = STAFF_CONTACTS[scheduleCoach.name] || {};
        const phone = formatPhone(ct.phone || '');
        const byDay = DAY_ORDER.map(day => ({ day, classes: RAW_SCHEDULE.filter(r => r.name === scheduleCoach.name && r.day === day).sort((a, b) => a.time.localeCompare(b.time)) })).filter(d => d.classes.length > 0);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 16 }}>
            <div style={{ background: C.bg, borderRadius: C.radius, border: `1px solid ${C.border}`, width: 460, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ background: C.blue, borderBottom: `1px solid ${C.blueBorder}`, padding: '16px 20px', borderRadius: `${C.radius} ${C.radius} 0 0`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={scheduleCoach.name} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.blueText }}>{shortName(scheduleCoach.name)}</div>
                  <div style={{ fontSize: 11, color: C.blueText, opacity: 0.8 }}>{RAW_SCHEDULE.filter(r => r.name === scheduleCoach.name).length} classes/week{phone ? ` · ${phone}` : ''}</div>
                </div>
                <button onClick={() => setScheduleCoach(null)} style={{ background: 'transparent', border: `1px solid ${C.blueBorder}`, borderRadius: C.radiusSm, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: C.blueText }}>✕</button>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {byDay.map(({ day, classes }) => (
                  <div key={day} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: C.blueText, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>{day}</div>
                    {classes.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < classes.length - 1 ? `1px solid ${C.bg3}` : 'none' }}>
                        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', minWidth: 130, textAlign: 'center' }}>{r.time}</div>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{r.cls}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* FIND SUB MODAL */}
      {findSubShift && (() => {
        const s = findSubShift;
        const busy = new Set(RAW_SCHEDULE.filter(r => r.day === s.day && r.time === s.time).map(r => r.name));
        const best = coaches.filter(c => c.name !== s.instructorName && !busy.has(c.name) && c.classes.includes(s.cls) && (availability[c.id] || []).includes(s.day));
        const ok = coaches.filter(c => c.name !== s.instructorName && !busy.has(c.name) && !c.classes.includes(s.cls) && (availability[c.id] || []).includes(s.day));
        const unavail = coaches.filter(c => c.name !== s.instructorName && !busy.has(c.name) && !(availability[c.id] || []).includes(s.day));
        const CoachRow = ({ c, level }) => {
          const ct = STAFF_CONTACTS[c.name] || {}; const phone = formatPhone(ct.phone || '');
          const [bg, tc, bc, label] = level === 'best' ? [C.green, C.greenText, C.greenBorder, '✓ teaches this class'] : level === 'ok' ? [C.yellow, C.yellowText, C.yellowBorder, 'available'] : [C.bg2, C.text3, C.border, 'unavailable'];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <Avatar name={c.name} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{shortName(c.name)}</div>
                <div style={{ fontSize: 11, color: C.text2 }}>{(availability[c.id] || []).map(d => DAY_SHORT[d]).join(' · ')}</div>
                {phone && <a href={`tel:${phone}`} style={{ fontSize: 11, color: C.blueText, textDecoration: 'none' }}>{phone}</a>}
              </div>
              <span style={pill(bg, tc, bc)}>{label}</span>
              {level !== 'unavail' && <button onClick={() => assignSub(s, c)} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Assign</button>}
            </div>
          );
        };
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ ...card, width: 440, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Find a Sub</div>
              <div style={{ fontSize: 12, color: C.text2, marginBottom: 14, background: C.bg2, borderRadius: C.radiusSm, padding: '6px 10px' }}>{s.day} · {s.time} · {s.cls} · covering {shortName(s.instructorName)}</div>
              {best.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.greenText, marginBottom: 6, textTransform: 'uppercase' }}>Best matches</div>{best.map(c => <CoachRow key={c.id} c={c} level="best" />)}</div>}
              {ok.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.yellowText, marginBottom: 6, textTransform: 'uppercase' }}>Available — different class</div>{ok.map(c => <CoachRow key={c.id} c={c} level="ok" />)}</div>}
              {best.length === 0 && ok.length === 0 && <div style={{ background: C.red, border: `1px solid ${C.redBorder}`, borderRadius: C.radiusSm, padding: '10px 14px', color: C.redText, fontSize: 13, marginBottom: 14 }}>No available coaches for {s.day} at this time.</div>}
              {unavail.length > 0 && <details><summary style={{ fontSize: 12, color: C.text2, cursor: 'pointer' }}>Show {unavail.length} unavailable coaches</summary><div style={{ marginTop: 8 }}>{unavail.slice(0, 8).map(c => <CoachRow key={c.id} c={c} level="unavail" />)}</div></details>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button onClick={() => setFindSubShift(null)} style={{ padding: '6px 16px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, background: C.bg2, cursor: 'pointer', color: C.text2, fontSize: 13 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* POST SHIFT MODAL */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ ...card, width: 390, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Post Substitute Shift</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Instructor calling out</label>
                <select value={form.instructorName} onChange={e => { ff('instructorName', e.target.value); ff('day', ''); ff('time', ''); ff('cls', ''); }} style={inputStyle}>
                  <option value="">— select instructor —</option>
                  {coaches.map(c => <option key={c.name} value={c.name}>{shortName(c.name)}</option>)}
                </select>
              </div>
              {form.instructorName && <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Day</label>
                <select value={form.day} onChange={e => { ff('day', e.target.value); ff('time', ''); ff('cls', ''); }} style={inputStyle}>
                  <option value="">— select day —</option>
                  {availableDays.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>}
              {form.day && classesOnDay.length > 0 && <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Class</label>
                <select value={form.cls} onChange={e => { const sel = classesOnDay.find(c => c.cls === e.target.value); ff('cls', e.target.value); if (sel) ff('time', sel.time); }} style={inputStyle}>
                  <option value="">— select class —</option>
                  {classesOnDay.map((c, i) => <option key={i} value={c.cls}>{c.time} · {c.cls}</option>)}
                </select>
              </div>}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Notes (optional)</label>
                <input value={form.notes} onChange={e => ff('notes', e.target.value)} placeholder="e.g. Studio A" style={inputStyle} />
              </div>
            </div>
            {error && <div style={{ marginTop: 10, fontSize: 12, color: C.redText }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPost(false)} style={{ padding: '7px 16px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, background: C.bg2, cursor: 'pointer', color: C.text2, fontSize: 13 }}>Cancel</button>
              <button onClick={postShift} disabled={!form.cls || loading} style={{ padding: '7px 18px', borderRadius: C.radiusSm, border: 'none', background: form.cls ? '#16a34a' : '#d1d5db', color: form.cls ? '#fff' : '#9ca3af', fontWeight: 600, cursor: form.cls ? 'pointer' : 'default', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? <Spinner /> : null}Post & notify coaches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ ...card, width: 400, maxWidth: '92vw' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Import iClassPro Schedule</div>
            <div style={{ background: C.blue, border: `1px solid ${C.blueBorder}`, borderRadius: C.radiusSm, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: C.blueText, lineHeight: 1.8 }}>
              <strong>How to export:</strong><br />Reports → Staff → Staff Schedule → Export → Tab delimited
            </div>
            <label style={{ display: 'block', background: '#2563eb', color: '#fff', border: 'none', borderRadius: C.radiusSm, padding: '9px 0', textAlign: 'center', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Choose file to upload
              <input type="file" accept=".csv,.txt,.tsv" style={{ display: 'none' }} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setShowImport(false)} style={{ padding: '6px 16px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, background: C.bg2, cursor: 'pointer', color: C.text2, fontSize: 13 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PROTOCOL MODAL */}
      {showProtocol && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 16 }}>
          <div style={{ background: C.bg, borderRadius: C.radius, border: `1px solid ${C.border}`, width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: '#7c3aed', padding: '20px 24px', borderRadius: `${C.radius} ${C.radius} 0 0` }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 2 }}>Sub Call-Out Protocol</div>
              <div style={{ fontSize: 12, color: '#c4b5fd' }}>Bay Aerials — Follow this process every time.</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {[
                { n: '01', title: 'Coach texts manager/owner', desc: 'All call-outs route through the manager — not the group chat. Minimum notice: 2 hours before class.' },
                { n: '02', title: 'Manager marks call-out in app', desc: "Open today's schedule, find the class, tap 'Mark Call-Out'. Class flips to red status until covered." },
                { n: '03', title: 'App surfaces available subs', desc: 'Only coaches NOT already teaching during that time slot are shown.' },
                { n: '04', title: 'Manager contacts subs in order', desc: 'Work down the available list by seniority, certification match, and fairness. First confirmed sub gets it.' },
                { n: '05', title: 'Assign + confirm in app', desc: "Tap coach's name → add note → Confirm Sub. Class flips to green." },
                { n: '06', title: 'If uncovered', desc: 'Manager covers personally OR notify families 60+ min before class with credit/makeup option.' },
                { n: '07', title: 'Post-class', desc: 'Sub logs hours in iClassPro same as a normal shift. Manager notes the swap for weekly payroll review.' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{ background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step.n}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: C.radiusSm, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#7c3aed', marginBottom: 8, textTransform: 'uppercase' }}>Key Rules</div>
                {['Coaches do NOT find their own subs — manager owns the process.', 'Every call-out gets logged, even if covered. Tracks reliability over time.', 'Same-day no-shows (no text): document in the note field for HR follow-up.'].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 2 ? 6 : 0, fontSize: 12, color: '#6d28d9' }}><span style={{ fontWeight: 700 }}>→</span><span>{r}</span></div>
                ))}
              </div>
              <button onClick={() => setShowProtocol(false)} style={{ width: '100%', padding: 10, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: C.radiusSm, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Got It</button>
              <div style={{ textAlign: 'center', fontSize: 10, color: C.text3, marginTop: 10 }}>Bay Aerials Gymnastics — Sub Ops v1.0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
