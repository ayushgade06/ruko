import {Easing, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Ruko's own identity: palette from app/globals.css, fonts from the app's next/font bundle.
export const BRAND = {
	name: 'Ruko',
	repo: 'github.com/ayushgade06/ruko',
	tagline: ['Wait,', 'before you pay.'],
};

loadFont({family: 'Fraunces', url: staticFile('fonts/Fraunces.woff2'), weight: '600 700'});
loadFont({family: 'Noto Sans', url: staticFile('fonts/NotoSans.woff2'), weight: '100 900'});
loadFont({family: 'Noto Sans Devanagari', url: staticFile('fonts/NotoSansDevanagari.woff2'), weight: '400 700'});

export const C = {
	// dark set (app dark mode)
	bg: '#0d0f11',
	bg2: '#101214',
	panel: '#191c20',
	line: '#2c3137',
	text: '#f1eee8',
	muted: '#aab1b9',
	dim: '#6f7780',
	accent: '#6cc0cf', // teal (dark)
	accentSoft: 'rgba(108,192,207,0.16)',
	danger: '#ff8f86', // danger text on dark
	dangerSolid: '#b3261e',
	caution: '#f2bb52',
	safe: '#63cf95',
	// light "paper" set (app light mode)
	paper: '#f7f4ee',
	paperCard: '#ffffff',
	paperLine: '#e2dccf',
	ink: '#15181b',
	inkMuted: '#4d545c',
	teal: '#0d5c6b', // teal (light)
	dangerInk: '#b3261e',
	cautionInk: '#8a5700',
	safeInk: '#1a7449',
	// template alias: the one accent colour
	amber: '#6cc0cf',
	amberSoft: 'rgba(108,192,207,0.16)',
	green: '#63cf95',
	coral: '#ff8f86',
};

export const F = {
	display: 'Fraunces, Georgia, serif',
	text: '"Noto Sans", "Noto Sans Devanagari", "Segoe UI", sans-serif',
	mono: '"Noto Sans", "Segoe UI", sans-serif', // labels: Noto Sans, tracked caps (no third font)
	deva: '"Noto Sans Devanagari", "Noto Sans", sans-serif',
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1); // entrances
export const glide = Easing.bezier(0.65, 0, 0.35, 1); // camera moves
