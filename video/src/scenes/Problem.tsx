import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Kicker, Reveal, Rise, Tag, useIn, useOut} from '../ui';
import {C, F, ease} from '../theme';
import {L, W} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Stat: React.FC<{at: number; big: string; what: string; src: string; x: number}> = ({at, big, what, src, x}) => {
	const p = useIn(at, 20);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: 410,
				width: 760,
				padding: '40px 46px 34px',
				background: C.paperCard,
				border: `2px solid ${C.paperLine}`,
				borderRadius: 22,
				opacity: p,
				translate: `0 ${(1 - p) * 30}px`,
				boxShadow: '0 24px 60px rgba(60,45,20,0.10)',
			}}
		>
			<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 112, lineHeight: 1, color: C.dangerInk, whiteSpace: "nowrap"}}>{big}</div>
			<div style={{fontFamily: F.text, fontWeight: 600, fontSize: 34, lineHeight: 1.25, color: C.ink, marginTop: 18}}>{what}</div>
			<div style={{fontFamily: F.text, fontSize: 20, color: C.inkMuted, marginTop: 22, letterSpacing: '0.04em'}}>SOURCE · {src}</div>
		</div>
	);
};

export const Problem: React.FC = () => {
	const f = useCurrentFrame();
	const p2 = L('p2');
	const statsIn = L('p3') - 6;
	const formulaUp = interpolate(f, [statsIn - 4, statsIn + 16], [0, 1], {...clamp, easing: ease});
	const statsOut = useOut(L('p5') - 10, 14);
	const gap = L('p5');
	const formulaOut = useOut(gap - 10, 14);
	const nothing = W('p6', 'nothing') - 3;
	const word = (w: string, nth = 0) => W('p2', w, nth) - 2;
	const plus = {color: C.teal, margin: '0 22px', fontWeight: 600};
	return (
		<AbsoluteFill>
			<Backdrop paper />
			<Kicker paper n="01">THE SCRIPT</Kicker>
			{/* the formula */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: interpolate(formulaUp, [0, 1], [380, 150]),
					textAlign: 'center',
					fontFamily: F.display,
					fontWeight: 700,
					fontSize: interpolate(formulaUp, [0, 1], [96, 58]),
					color: C.ink,
					lineHeight: 1.1,
					opacity: formulaOut,
				}}
			>
				<Reveal at={word('authority')}>Authority</Reveal>
				<Reveal at={word('fear')}>
					<span style={plus}>+</span>Fear
				</Reveal>
				<Reveal at={word('isolation')}>
					<span style={plus}>+</span>Isolation
				</Reveal>
				<br />
				<Reveal at={word('unusual')}>
					<span style={plus}>+</span>
					<span style={{color: C.dangerInk}}>an unusual payment</span>
				</Reveal>
			</div>
			<div style={{opacity: statsOut}}>
				<Stat at={statsIn} x={150} big="$7.7 billion" what="reported lost by Americans aged 60+ in 2025 (all cyber-enabled fraud)" src="FBI IC3 2025 ANNUAL REPORT" />
				<Stat at={L('p4') - 6} x={1010} big="83,668" what={'WhatsApp accounts blocked for “digital arrest” scams in India'} src="MHA REPLY IN RAJYA SABHA · PIB, 12 MAR 2025" />
			</div>
			{/* before / during */}
			<div style={{position: 'absolute', left: 150, right: 150, top: 300, display: 'flex', gap: 30, opacity: useIn(gap - 4, 16)}}>
				<div style={{flex: 1}}>
					<Tag color={C.inkMuted}>Before the call</Tag>
					<div style={{display: 'flex', gap: 20, marginTop: 22}}>
						{[
							['Caller ID', 'knows numbers already reported', W('p5', 'caller')],
							['Awareness', 'helps before the phone rings', W('p5', 'awareness')],
						].map(([h, b, at]) => (
							<Rise key={h as string} at={(at as number) - 3} style={{flex: 1, background: C.paperCard, border: `2px solid ${C.paperLine}`, borderRadius: 20, padding: '30px 30px'}}>
								<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 52, color: C.ink}}>{h}</div>
								<div style={{fontFamily: F.text, fontSize: 28, color: C.inkMuted, marginTop: 10}}>{b}</div>
							</Rise>
						))}
					</div>
				</div>
				<div style={{width: 560}}>
					<Tag color={C.dangerInk}>During the call</Tag>
					<div
						style={{
							marginTop: 22,
							height: 196,
							borderRadius: 20,
							border: `3px dashed ${interpolate(f, [nothing, nothing + 10], [0, 1], clamp) > 0.5 ? C.dangerInk : C.paperLine}`,
							display: 'grid',
							placeItems: 'center',
							fontFamily: F.display,
							fontWeight: 700,
							fontSize: 64,
							color: C.dangerInk,
						}}
					>
						<Reveal at={nothing}>Nothing.</Reveal>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
