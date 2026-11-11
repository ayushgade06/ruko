import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {TL} from './timeline';
import {BRAND, C, F} from './theme';

// Phrases from the voice engine's own WordBoundary timings (scripts/voiceover.py). Each phrase knows its
// spoken words, so the current word can be highlighted.
const phrases = TL.lines.flatMap((l) =>
	l.phrases.map((p) => {
		const from = l.from + Math.round(p.start * TL.fps);
		const to = l.from + Math.round(p.end * TL.fps) + 4;
		const words = l.words.map((w) => l.from + w.f).filter((f) => f >= from - 1 && f < to - 2);
		return {text: p.text, from, to, who: l.who, words};
	}),
);

const WHO_COLOR: Record<string, string> = {Kamala: C.accent, Frank: C.accent};

/** Burned-in captions: big, high-contrast, max 2 lines, current word highlighted, speaker tag for characters. */
export const Captions: React.FC = () => {
	const f = useCurrentFrame();
	const cur = phrases.find((p) => f >= p.from && f < p.to);
	if (!cur) return null;
	const o = interpolate(f, [cur.from, cur.from + 3, cur.to - 3, cur.to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const shown = cur.text.split(' ');
	// map spoken-word progress onto displayed words (display tokens like "$7.7 billion" span several spoken words)
	const spokenDone = cur.words.filter((w) => w <= f).length;
	const idx = cur.words.length ? Math.min(shown.length - 1, Math.floor(((spokenDone - 0.5) / cur.words.length) * shown.length)) : -1;
	const tagColor = WHO_COLOR[cur.who] ?? C.danger;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div
				style={{
					maxWidth: 1560,
					padding: '12px 30px 14px',
					borderRadius: 12,
					background: 'rgba(8,9,10,0.86)',
					boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
					fontFamily: F.text,
					fontWeight: 600,
					fontSize: 46,
					lineHeight: 1.18,
					color: '#ffffff',
					textAlign: 'center',
					display: 'flex',
					alignItems: 'baseline',
					gap: 18,
				}}
			>
				{cur.who ? (
					<span style={{fontSize: 22, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: tagColor, whiteSpace: 'nowrap'}}>
						{cur.who}
					</span>
				) : null}
				<span style={{fontStyle: cur.who && cur.who.startsWith('Caller') ? 'italic' : 'normal'}}>
					{shown.map((w, i) => {
						const brand = w.replace(/[^A-Za-z]/g, '') === BRAND.name || w.startsWith(BRAND.name + "'");
						const now = i === idx;
						return (
							<span key={i} style={{color: now ? C.accent : brand ? C.accent : i < idx ? '#ffffff' : 'rgba(255,255,255,0.78)'}}>
								{w}
								{i < shown.length - 1 ? ' ' : ''}
							</span>
						);
					})}
				</span>
			</div>
		</div>
	);
};
