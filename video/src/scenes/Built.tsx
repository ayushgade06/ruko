import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Backdrop, Beat, Hl, Kicker, Mark, Phone, Reveal, Rise, Source, Tag, useIn, useOut} from '../ui';
import {BRAND, C, F, ease} from '../theme';
import {E, L, TL, W} from '../timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Box: React.FC<{at: number; x: number; y: number; w: number; h: number; tag: string; title: string; lines: React.ReactNode[]; tone?: string}> = ({at, x, y, w, h, tag, title, lines, tone = C.teal}) => {
	const p = useIn(at, 18);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				boxSizing: 'border-box',
				background: C.paperCard,
				border: `2px solid ${C.paperLine}`,
				borderTop: `6px solid ${tone}`,
				borderRadius: 18,
				padding: '22px 28px',
				opacity: p,
				translate: `0 ${(1 - p) * 24}px`,
				boxShadow: '0 20px 50px rgba(60,45,20,0.10)',
			}}
		>
			<div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.18em', color: tone}}>{tag}</div>
			<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 46, color: C.ink, marginTop: 6}}>{title}</div>
			<div style={{marginTop: 8}}>
				{lines.map((l, i) => (
					<div key={i} style={{fontFamily: F.text, fontSize: 27, color: C.inkMuted, lineHeight: 1.45}}>
						{l}
					</div>
				))}
			</div>
		</div>
	);
};

const Wire: React.FC<{at: number; d: string}> = ({at, d}) => {
	const p = useIn(at, 22);
	return <path d={d} fill="none" stroke={C.inkMuted} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} markerEnd={p > 0.95 ? 'url(#arr)' : undefined} />;
};

// lib/rules.ts (13 RULES, EN/HI/Hinglish), app/api/analyze/route.ts (Claude, structured output), lib/verdict.ts merge(): max().
export const How: React.FC = () => {
	const f = useCurrentFrame();
	const rules = W('h2', 'device') - 6;
	const ai = W('h3', 'claude') - 6;
	const mx = W('h4', 'higher') - 6;
	const meter = W('h4', 'green') - 10;
	const needle = interpolate(f, [meter, meter + 40], [0.12, 0.92], {...clamp, easing: ease});
	return (
		<AbsoluteFill>
			<Backdrop paper />
			<Kicker paper n="05">HOW IT WORKS</Kicker>
			<Source paper style={{right: 120, top: 60}}>SOURCE · lib/rules.ts · app/api/analyze/route.ts · lib/verdict.ts</Source>
			<AbsoluteFill style={{scale: '1.13', transformOrigin: '960px 520px', translate: '0 20px'}}>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<defs>
					<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
						<path d="M0 0 L10 5 L0 10z" fill={C.inkMuted} />
					</marker>
				</defs>
				<Wire at={rules - 10} d="M420 480 C 470 480, 470 300, 540 300" />
				<Wire at={ai - 10} d="M420 480 C 470 480, 470 650, 540 650" />
				<Wire at={mx - 12} d="M1080 300 C 1150 300, 1150 470, 1200 470" />
				<Wire at={mx - 12} d="M1080 650 C 1150 650, 1150 490, 1200 490" />
				<Wire at={meter - 10} d="M1450 480 L 1530 480" />
			</svg>
			<Box at={0} x={120} y={370} w={300} h={220} tag="IN THE BROWSER" title="The call" lines={['on speaker', '→ speech to text']} tone={C.inkMuted} />
			<Box
				at={rules}
				x={540}
				y={190}
				w={540}
				h={230}
				tag="ON YOUR DEVICE · INSTANT"
				title="Rules engine"
				lines={[
					<Reveal key="a" at={W('h2', 'thirteen') - 2}>13 scam tactics</Reveal>,
					<Reveal key="b" at={W('h2', 'english') - 2}>
						English · <span style={{fontFamily: F.deva}}>हिंदी</span> · Hinglish
					</Reveal>,
				]}
			/>
			<Box
				at={ai}
				x={540}
				y={540}
				w={540}
				h={230}
				tag="SERVER · STRUCTURED OUTPUT"
				title="Claude Haiku 5.5"
				lines={[<Reveal key="a" at={W('h3', 'intent') - 2}>reads intent</Reveal>, <Reveal key="b" at={W('h3', 'quotes') - 2}>quotes the caller</Reveal>]}
			/>
			<div style={{position: 'absolute', left: 1200, top: 400, width: 250, height: 160, borderRadius: 18, background: C.ink, display: 'grid', placeItems: 'center', opacity: useIn(mx, 16), scale: String(0.9 + 0.1 * useIn(mx, 16))}}>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 52, color: C.paper}}>max( )</div>
				<div style={{fontFamily: F.text, fontSize: 22, color: '#aab1b9', marginTop: -30}}>the higher score wins</div>
			</div>
			<div style={{position: 'absolute', left: 1530, top: 360, width: 280, opacity: useIn(meter, 16)}}>
				<svg viewBox="0 0 200 112" width={280}>
					<path d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke={C.paperLine} strokeWidth={16} strokeLinecap="round" />
					<path d="M14 100 A86 86 0 0 1 186 100" fill="none" stroke={C.dangerInk} strokeWidth={16} strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - needle * 100} />
				</svg>
				<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 28, color: C.ink, textAlign: 'center', marginTop: 10}}>Only goes up</div>
				<div style={{fontFamily: F.text, fontSize: 22, color: C.inkMuted, textAlign: 'center'}}>during a call</div>
			</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// The real /how-it-works eval table (desktop capture, 2x) as evidence. Numbers: eval/results.json.
const TABLE = {x: 361, y: 1062, w: 718, h: 221}; // css px in how_desk.png (2880 px wide = 1440 css)
export const Proof: React.FC = () => {
	const tw = 900;
	const s = tw / TABLE.w;
	const rowHl = (y: number) => [0, y, TABLE.w, 46] as [number, number, number, number];
	const r1 = W('e2', 'rules') - 4;
	const r3 = W('e2', 'claude') - 4;
	const fa = W('e3', 'two') - 4;
	const v = W('e3', 'show') - 6;
	const col = (at: number, k: string, x: number, w: number, children: React.ReactNode, tone = C.accent) => {
		const p = useIn(at, 18);
		return (
			<div style={{position: 'absolute', left: x, top: 260, width: w, opacity: p, translate: `0 ${(1 - p) * 26}px`}}>
				<div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.22em', color: tone}}>{k}</div>
				<div style={{marginTop: 22}}>{children}</div>
			</div>
		);
	};
	return (
		<AbsoluteFill>
			<Backdrop />
			<Kicker n="06">CLAIM → EVIDENCE → VERDICT</Kicker>
			<Source style={{right: 120, top: 60}}>REAL CAPTURE · /how-it-works · eval/results.json · 32 CASES WE WROTE</Source>
			{col(
				0,
				'CLAIM',
				110,
				380,
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 56, lineHeight: 1.1, color: C.text}}>
					Catches the scam. Doesn’t cry wolf.
				</div>,
			)}
			{col(
				L('e1'),
				'EVIDENCE',
				540,
				tw,
				<div style={{position: 'relative', width: tw, height: TABLE.h * s, overflow: 'hidden', borderRadius: 16, boxShadow: `0 0 0 1px ${C.line}, 0 30px 80px rgba(0,0,0,0.5)`}}>
					<Img src={staticFile('shots/how_desk.png')} style={{position: 'absolute', width: 1440 * s, left: -TABLE.x * s, top: -TABLE.y * s, maxWidth: 'none'}} />
					<div style={{position: 'absolute', left: 0, top: 0, width: TABLE.w, height: TABLE.h, scale: String(s), transformOrigin: '0 0'}}>
						<Hl at={r1} until={r3 - 4} rect={rowHl(53)} label="" color={C.caution} dim={0.4} />
						<Hl at={r3} until={fa - 4} rect={rowHl(167)} color={C.teal} dim={0.4} />
						<Hl at={fa} rect={[548, 167, 170, 46]} color={C.dangerInk} dim={0.4} />
					</div>
				</div>,
			)}
			<div style={{position: 'absolute', left: 540, top: 650, width: tw, fontFamily: F.text, fontSize: 36, lineHeight: 1.5, color: C.muted}}>
				<Rise at={r1}>
					Rules only: <b style={{color: C.text}}>16 / 18</b> scams caught
				</Rise>
				<Rise at={r3}>
					Ruko (rules + Claude): <b style={{color: C.accent}}>18 / 18</b> caught
				</Rise>
				<Rise at={fa}>
					Real messages marked caution: <b style={{color: C.danger}}>2 / 14</b>
				</Rise>
			</div>
			{col(
				v,
				'VERDICT',
				1500,
				330,
				<div style={{border: `5px solid ${C.accent}`, borderRadius: 16, padding: '22px 24px', rotate: '-3deg', scale: String(interpolate(useCurrentFrame(), [v, v + 8], [1.4, 1], {...clamp, easing: ease}))}}>
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 64, lineHeight: 1, color: C.accent}}>18/18</div>
					<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 26, color: C.text, marginTop: 8}}>scams caught</div>
					<div style={{fontFamily: F.text, fontSize: 24, color: C.muted, marginTop: 12}}>2 false cautions, published</div>
				</div>,
			)}
		</AbsoluteFill>
	);
};

export const Trust: React.FC = () => {
	const items: [string, number, React.ReactNode?][] = [
		['No accounts', W('t1', 'accounts') - 4],
		['No audio leaves the device', W('t1', 'audio') - 6],
		['Big type · high contrast', W('t1', 'big') - 4],
		[
			'Screen-reader announcements',
			W('t1', 'screen-reader') - 4,
			<div key="sr" style={{fontFamily: F.text, fontSize: 24, color: C.dim, marginTop: 6}}>
				aria-live: “Likely a scam. Hang up. This is a scam. Asks you to move money”
			</div>,
		],
		['हिंदी · Hindi', W('t1', 'hindi') - 4],
	];
	return (
		<AbsoluteFill>
			<Backdrop />
			<Kicker n="07">BUILT FOR THE PERSON ON THE CALL</Kicker>
			<Source style={{right: 120, top: 60}}>REAL CAPTURE · /listen IN HINDI</Source>
			<div style={{position: 'absolute', left: 120, top: 220, width: 900}}>
				{items.map(([t, at, extra]) => (
					<Rise key={t} at={at} style={{padding: '18px 0', borderTop: `1px solid ${C.line}`}}>
						<div style={{fontFamily: t.startsWith('हिं') ? F.deva : F.display, fontWeight: 700, fontSize: 54, color: C.text}}>{t}</div>
						{extra}
					</Rise>
				))}
			</div>
			<Phone light cx={1450} shots={[{src: 'shots/hi_09a.png', at: 0}]} keys={[[0, 60, 1.0, 466], [TL.scenes.find((s) => s.id === 'trust')!.dur, 60, 1.08, 420]]}>
				<Hl at={W('t1', 'hindi') - 2} rect={[18, 775, 394, 225]} label="यह कहें · SAY THIS" />
			</Phone>
		</AbsoluteFill>
	);
};

export const Close: React.FC = () => {
	const f = useCurrentFrame();
	const dur = TL.scenes[TL.scenes.length - 1].dur;
	const end = L('x2');
	const nextOut = useOut(end - 6, 10);
	const black = interpolate(f, [dur - 28, dur - 2], [0, 1], clamp);
	const chips: [string, number][] = [
		['Android call screening', L('x1')],
		['More languages', W('x1', 'languages') - 4],
		['Bank & NGO partners', W('x1', 'bank') - 4],
	];
	return (
		<AbsoluteFill>
			<Backdrop glow={`radial-gradient(ellipse 45% 40% at 50% 42%, rgba(108,192,207,${0.13 * useIn(end, 50)}) 0%, rgba(0,0,0,0) 70%)`} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: nextOut}}>
				<Tag color={C.accent} style={{fontSize: 34}}>What’s next</Tag>
				<div style={{display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40}}>
					{chips.map(([t, at]) => (
						<Rise key={t} at={at} style={{padding: '26px 36px', borderRadius: 20, border: `2px solid ${C.line}`, background: C.panel, fontFamily: F.display, fontWeight: 600, fontSize: 46, color: C.text}}>
							{t}
						</Rise>
					))}
				</div>
			</div>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 150}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: useIn(end - 6, 16)}}>
					<Mark size={150} />
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 190, lineHeight: 0.9, color: C.text}}>
						<Reveal at={end - 4}>{BRAND.name}</Reveal>
					</div>
				</div>
				<div style={{fontFamily: F.display, fontWeight: 600, fontSize: 84, marginTop: 34}}>
					<Reveal at={W('x2', 'wait') - 2} style={{color: C.text}}>
						{BRAND.tagline[0]}
					</Reveal>{' '}
					<Reveal at={W('x2', 'before') - 2} style={{color: C.accent}}>
						{BRAND.tagline[1]}
					</Reveal>
				</div>
				<div style={{marginTop: 54, textAlign: 'center', opacity: useIn(E('x2') + 6, 20)}}>
					<div style={{fontFamily: F.text, fontWeight: 600, fontSize: 36, color: C.text}}>{BRAND.repo}</div>
					<div style={{fontFamily: F.text, fontSize: 26, color: C.muted, marginTop: 14}}>Built with Next.js · AI SDK · Claude · Web Speech API</div>
					<div style={{fontFamily: F.text, fontSize: 22, color: C.dim, marginTop: 10}}>AI tools used: Claude Code helped plan, write and test this project · IceHacks 2026</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: '#000', opacity: black}} />
		</AbsoluteFill>
	);
};
