import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Reveal, Tag, useIn} from '../ui';
import {C, F, ease} from '../theme';
import {E, L, TL, W} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// A stylized (drawn, fictional) incoming-call screen. No real numbers, brands or faces.
const CallPhone: React.FC<{x: number; place: string; time: string; answerAt: number; lineId: string; words: string}> = ({x, place, time, answerAt, lineId, words}) => {
	const f = useCurrentFrame();
	const ans = interpolate(f, [answerAt, answerAt + 10], [0, 1], {...clamp, easing: ease});
	const ringing = 1 - ans;
	const pulse = (Math.sin(f / 4) + 1) / 2;
	const secs = Math.max(0, Math.floor((f - answerAt) / 30));
	const ws = words.split(' ');
	const l = TL.lines.find((x) => x.id === lineId)!;
	const said = l.words.filter((w) => f >= l.local + w.f - 2).length; // reveal as spoken
	const shown = Math.round((said / Math.max(1, l.words.length)) * ws.length);
	return (
		<div style={{position: 'absolute', left: x, top: 92, width: 380}}>
			<Tag color={C.accent} style={{textAlign: 'center', marginBottom: 10}}>{place}</Tag>
			<div style={{fontFamily: F.text, fontSize: 22, color: C.muted, textAlign: 'center', marginBottom: 22}}>{time}</div>
			<div
				style={{
					height: 640,
					borderRadius: 54,
					padding: 14,
					background: 'linear-gradient(160deg, #2a2e33 0%, #121417 45%, #1d2125 100%)',
					boxShadow: '0 0 0 2px #3a3f45, 0 40px 120px rgba(0,0,0,0.6)',
				}}
			>
				<div style={{height: '100%', borderRadius: 42, background: 'linear-gradient(180deg,#1a1d21,#0e1013)', position: 'relative', overflow: 'hidden'}}>
					<div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center'}}>
						<div
							style={{
								margin: '0 auto',
								width: 112,
								height: 112,
								borderRadius: 56,
								background: '#2c3137',
								display: 'grid',
								placeItems: 'center',
								boxShadow: `0 0 0 ${ringing * (10 + pulse * 18)}px rgba(108,192,207,${0.18 * ringing})`,
							}}
						>
							<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#aab1b9" strokeWidth="1.8">
								<circle cx="12" cy="8" r="4" />
								<path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
							</svg>
						</div>
						<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 34, color: C.text, marginTop: 26}}>Unknown caller</div>
						<div style={{fontFamily: F.text, fontSize: 22, color: C.muted, marginTop: 6}}>
							{ans > 0.5 ? `0:${String(secs).padStart(2, '0')}` : 'incoming call…'}
						</div>
					</div>
					{/* what the caller says, as it is said */}
					<div
						style={{
							position: 'absolute',
							left: 24,
							right: 24,
							top: 330,
							opacity: ans,
							fontFamily: F.display,
							fontWeight: 600,
							fontSize: 30,
							lineHeight: 1.25,
							color: C.text,
						}}
					>
						“{ws.slice(0, shown).join(' ')}
						<span style={{opacity: 0.25}}>{shown < ws.length ? ' ' + ws.slice(shown).join(' ') : ''}</span>”
					</div>
					{/* buttons: decline / accept while ringing, end call once answered */}
					<div style={{position: 'absolute', bottom: 48, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: ringing > 0.5 ? 120 : 0}}>
						<div style={{width: 74, height: 74, borderRadius: 37, background: '#b3261e', display: 'grid', placeItems: 'center'}}>
							<svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" style={{rotate: '135deg'}}>
								<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
							</svg>
						</div>
						{ringing > 0.5 ? (
							<div style={{width: 74, height: 74, borderRadius: 37, background: '#1a7449', display: 'grid', placeItems: 'center', translate: `0 ${-pulse * 6}px`}}>
								<svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
									<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
								</svg>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export const Cold: React.FC = () => {
	const f = useCurrentFrame();
	const t = L('c4');
	const dimP = useIn(t - 6, 18);
	const split = useIn(0, 30);
	return (
		<AbsoluteFill>
			<Backdrop glow="radial-gradient(ellipse 60% 55% at 50% 40%, rgba(108,192,207,0.07) 0%, rgba(0,0,0,0) 70%)" />
			<AbsoluteFill style={{opacity: 1 - dimP * 0.82, filter: `blur(${dimP * 6}px)`, scale: String(1 - dimP * 0.04)}}>
				<CallPhone x={300} place="Ohio, USA" time="Tuesday · 9:30 AM" answerAt={L('c1') - 8} lineId="c1" words="A warrant has been issued for your arrest. Do not hang up." />
				<CallPhone x={1240} place="Pune, India" time="Tuesday · 8:00 PM" answerAt={L('c2') - 8} lineId="c2" words="Madam, you are under digital arrest." />
				{/* the split */}
				<div style={{position: 'absolute', left: 959, top: 120, width: 2, height: 720 * split, background: C.line}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.dim, opacity: interpolate(f, [20, 40], [0, 1], clamp)}}>
					SAME MOMENT
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 80}}>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 168, lineHeight: 0.95, color: C.text, textAlign: 'center'}}>
					<Reveal at={W('c4', 'same') - 2}>Same script.</Reveal>
				</div>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 168, lineHeight: 0.95, color: C.accent, textAlign: 'center', marginTop: 10}}>
					<Reveal at={W('c4', 'every') - 2}>Every country.</Reveal>
				</div>
				<div style={{marginTop: 34, fontFamily: F.text, fontSize: 24, color: C.dim, letterSpacing: '0.1em', opacity: useIn(E('c4'), 16)}}>
					DRAMATIZED · FICTIONAL CALLERS
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
