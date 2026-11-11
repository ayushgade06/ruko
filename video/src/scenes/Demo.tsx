import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Beat, Hl, Kicker, Phone, Rise, Source, Tag} from '../ui';
import {C, F} from '../theme';
import {E, L, W} from '../timeline';

// All screens are real captures of /listen running the "Digital arrest" sample call (see capture/da_*.txt).
// Values on the right are read off those same screens.
export const PX = 1130; // right column
export const Quote: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 50, color = C.text}) => (
	<div style={{fontFamily: F.display, fontWeight: 600, fontSize: size, lineHeight: 1.18, color, marginTop: 20}}>{children}</div>
);
export const Row: React.FC<{at: number; who: string; score: number; level: string; color: string}> = ({at, who, score, level, color}) => (
	<Rise at={at} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '22px 0', borderTop: `1px solid ${C.line}`}}>
		<div style={{fontFamily: F.text, fontWeight: 600, fontSize: 32, color: C.muted, width: 300}}>{who}</div>
		<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 84, color, width: 130, textAlign: 'right'}}>{score}</div>
		<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 34, color}}>{level}</div>
	</Rise>
);
export const Chip: React.FC<{children: React.ReactNode; solid?: boolean}> = ({children, solid}) => (
	<span
		style={{
			display: 'inline-block',
			padding: '14px 24px',
			borderRadius: 14,
			fontFamily: F.text,
			fontWeight: 700,
			fontSize: 28,
			marginRight: 14,
			marginTop: 14,
			background: solid ? '#fff' : 'transparent',
			color: solid ? '#7a1a14' : '#fff',
			border: solid ? 'none' : '2px solid rgba(255,255,255,0.7)',
		}}
	>
		{children}
	</span>
);

export const Demo: React.FC = () => {
	const careful = W('d2', 'claude');
	const c6 = E('d3') - 6; // after line 6 lands
	const dz = W('d4', 'danger');
	const c8 = E('d5') - 6;
	const c9 = W('d6', 'rooko');
	const hang = L('d8');
	return (
		<AbsoluteFill>
			<Backdrop glow="radial-gradient(ellipse 38% 60% at 31% 50%, rgba(108,192,207,0.08) 0%, rgba(0,0,0,0) 70%)" />
			<Kicker n="02">DURING THE CALL</Kicker>
			<Source style={{right: 120, top: 60}}>REAL CAPTURE · /listen · SAMPLE CALL “DIGITAL ARREST” · CONDENSED</Source>
			<Phone
				cx={600}
				shots={[
					{src: 'shots/da_01r.png', at: 0},
					{src: 'shots/da_01a.png', at: careful},
					{src: 'shots/da_06a.png', at: c6, cut: true},
					{src: 'shots/da_08a.png', at: c8, cut: true},
					{src: 'shots/da_09a.png', at: c9, cut: true},
				]}
				keys={[
					[0, 840, 1.0, 466],
					[110, 840, 1.32, 380],
					[W('d2', 'device') - 16, 840, 1.32, 380],
					[W('d2', 'device') + 6, 0, 1.32, 316],
					[c6 - 1, 0, 1.32, 316],
					[c6, 1830, 1.32, 235],
					[dz - 16, 1830, 1.32, 235],
					[dz + 4, 480, 1.28, 241],
					[c8 - 1, 480, 1.28, 241],
					[c8, 1700, 1.32, 288],
					[c9 - 1, 1700, 1.32, 288],
					[c9, 640, 1.45, 289],
					[hang - 14, 640, 1.45, 289],
					[hang + 4, 0, 1.15, 330],
				]}
			>
				<Hl at={110} until={W('d2', 'device') - 18} rect={[37, 1183, 356, 77]} label="HEARD" />
				<Hl at={W('d2', 'safe') - 12} until={careful - 4} rect={[18, 187, 394, 258]} label="RULES · 25" color={C.safe} />
				<Hl at={careful + 10} until={c6 - 8} rect={[18, 187, 394, 258]} label="CLAUDE · 45" color={C.caution} />
				<Hl at={W('d4', 'flag') - 2} until={dz - 18} rect={[18, 1945, 394, 241]} label="THE CALLER'S WORDS" />
				<Hl at={dz + 4} until={c8 - 8} rect={[18, 592, 394, 258]} label="DANGER · 100" color={C.danger} />
				<Hl at={c8 + 8} until={c9 - 8} rect={[18, 1880, 394, 216]} label="MOVE MONEY" color={C.danger} />
				<Hl at={W('d6', 'tells') - 4} until={hang - 16} rect={[18, 816, 394, 225]} label="SAY THIS" />
				<Hl at={hang + 6} until={W('d8', 'help') - 4} rect={[18, 131, 394, 383]} label="HANG UP" color={C.danger} />
				<Hl at={W('d8', 'help')} rect={[41, 311, 349, 180]} label="ONE TAP" />
			</Phone>

			<Beat from={8} to={L('d2') - 4} style={{left: PX, top: 230, width: 680}}>
				<Tag color={C.danger}>Caller · fictional</Tag>
				<Quote>“This is Inspector Rajesh Sharma, from Mumbai Cyber Crime branch.”</Quote>
			</Beat>
			<Beat from={L('d2')} to={c6 - 4} style={{left: PX, top: 250, width: 680}}>
				<Tag>Two checks, one meter</Tag>
				<div style={{marginTop: 26}}>
					<Row at={W('d2', 'device') - 4} who="On-device rules" score={25} level="Looks safe" color={C.safe} />
					<Row at={careful} who="Claude Haiku 5.5" score={45} level="Be careful" color={C.caution} />
				</div>
				<Rise at={W('d2', 'careful') + 10} style={{fontFamily: F.text, fontSize: 26, color: C.dim, marginTop: 20}}>
					The meter shows the higher of the two.
				</Rise>
			</Beat>
			<Beat from={c6} to={L('d5') + 4} style={{left: PX, top: 200, width: 680}}>
				<Tag color={C.danger}>Red flag</Tag>
				<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 36, color: C.text, marginTop: 16}}>Tells you to stay on the call or keep it secret</div>
				<Quote size={44} color={C.muted}>
					“Do not disconnect the call and do not tell anyone, not even your family.”
				</Quote>
				<Rise at={dz} style={{marginTop: 34, display: 'flex', alignItems: 'baseline', gap: 22}}>
					<span style={{fontFamily: F.display, fontWeight: 700, fontSize: 110, color: C.danger}}>100</span>
					<span style={{fontFamily: F.text, fontWeight: 700, fontSize: 38, color: C.danger}}>Likely a scam</span>
				</Rise>
			</Beat>
			<Beat from={L('d5') + 6} to={c9 - 4} style={{left: PX, top: 260, width: 680}}>
				<Tag color={C.danger}>Red flag</Tag>
				<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 36, color: C.text, marginTop: 16}}>Asks you to move money</div>
				<Quote size={46} color={C.muted}>
					“…transfer your savings to an RBI verification account.”
				</Quote>
			</Beat>
			<Beat from={c9} to={hang - 6} style={{left: PX, top: 220, width: 700}}>
				<Tag color={C.accent}>Say this · written by Claude for this call</Tag>
				<Quote size={58}>“I will not transfer any money, and I am hanging up now to call my family and the police directly.”</Quote>
			</Beat>
			<Beat from={hang} style={{left: PX, top: 250, width: 700}}>
				<div style={{background: C.dangerSolid, borderRadius: 26, padding: '38px 40px 40px'}}>
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 68, lineHeight: 1.05, color: '#fff'}}>Hang up. This is a scam.</div>
					<div style={{fontFamily: F.text, fontSize: 28, color: 'rgba(255,255,255,0.9)', marginTop: 12}}>You are not in trouble. Real officials never do this.</div>
					<div style={{marginTop: 16}}>
						<Chip solid>Tell family</Chip>
						<Chip>Call 1930</Chip>
					</div>
				</div>
			</Beat>
		</AbsoluteFill>
	);
};
