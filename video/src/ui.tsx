import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, F, ease, glide} from './theme';

type Rect = [number, number, number, number];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 eased progress starting at `at`. */
export const useIn = (at: number, dur = 18, easing = ease) => {
	const f = useCurrentFrame();
	return interpolate(f, [at, at + dur], [0, 1], {...clamp, easing});
};

/** 1→0 progress for exits. */
export const useOut = (at: number, dur = 14) => {
	const f = useCurrentFrame();
	return interpolate(f, [at, at + dur], [1, 0], {...clamp, easing: glide});
};

/** Dark or paper background with slow-moving film grain and a vignette. */
export const Backdrop: React.FC<{paper?: boolean; glow?: string}> = ({paper, glow}) => {
	const f = useCurrentFrame();
	const gx = Math.floor(random(`gx${Math.floor(f / 2)}`) * 512);
	const gy = Math.floor(random(`gy${Math.floor(f / 2)}`) * 512);
	return (
		<AbsoluteFill style={{backgroundColor: paper ? C.paper : C.bg}}>
			{glow ? <AbsoluteFill style={{background: glow}} /> : null}
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('noise.png')})`,
					backgroundPosition: `${gx}px ${gy}px`,
					opacity: paper ? 0.07 : 0.05,
					mixBlendMode: paper ? 'multiply' : 'screen',
				}}
			/>
			<AbsoluteFill
				style={{
					background: paper
						? 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(60,45,20,0.18) 100%)'
						: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Text that slides up out of a mask. */
export const Reveal: React.FC<{at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number}> = ({
	at,
	dur = 20,
	children,
	style,
	dist = 1.05,
}) => {
	const p = useIn(at, dur);
	return (
		<span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.04em', ...style}}>
			<span style={{display: 'inline-block', translate: `0 ${(1 - p) * dist * 100}%`, opacity: interpolate(p, [0, 0.3], [0, 1], clamp)}}>
				{children}
			</span>
		</span>
	);
};

/** Fades + lifts a block in. */
export const Rise: React.FC<{at: number; dur?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	at,
	dur = 18,
	y = 24,
	children,
	style,
}) => {
	const p = useIn(at, dur);
	return <div style={{opacity: p, translate: `0 ${(1 - p) * y}px`, ...style}}>{children}</div>;
};

/** Small mono chapter label, e.g. "02 · THE AUDIENCE". */
export const Kicker: React.FC<{n?: string; children: React.ReactNode; at?: number; paper?: boolean; style?: React.CSSProperties}> = ({
	n,
	children,
	at = 4,
	paper,
	style,
}) => {
	const p = useIn(at, 16);
	return (
		<div
			style={{
				position: 'absolute',
				left: 120,
				top: 56,
				fontFamily: F.mono,
				fontSize: 22,
				letterSpacing: '0.22em',
				color: paper ? C.inkMuted : C.muted,
				opacity: p,
				translate: `${(1 - p) * -16}px 0`,
				display: 'flex',
				gap: 18,
				alignItems: 'center',
				...style,
			}}
		>
			{n ? <span style={{color: paper ? C.teal : C.amber}}>{n}</span> : null}
			<span style={{width: 36, height: 2, background: paper ? C.paperLine : C.line}} />
			<span>{children}</span>
		</div>
	);
};

/** Amber corner brackets, the app's panel signature. */
export const Corners: React.FC<{p?: number; color?: string; size?: number; w?: number}> = ({p = 1, color = C.amber, size = 26, w = 3}) => {
	const s = size * p;
	const common = {position: 'absolute' as const, width: s, height: s, opacity: p};
	return (
		<>
			<div style={{...common, left: -1, top: -1, borderLeft: `${w}px solid ${color}`, borderTop: `${w}px solid ${color}`}} />
			<div style={{...common, right: -1, bottom: -1, borderRight: `${w}px solid ${color}`, borderBottom: `${w}px solid ${color}`}} />
		</>
	);
};

type Key = [number, Rect];
const camAt = (f: number, keys: Key[]): Rect => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [fa, ra] = keys[i];
		const [fb, rb] = keys[i + 1];
		if (f <= fb) {
			const t = interpolate(f, [fa, fb], [0, 1], {...clamp, easing: glide});
			return ra.map((v, j) => v + (rb[j] - v) * t) as Rect;
		}
	}
	return keys[keys.length - 1][1];
};

/**
 * A virtual camera over a 1920×1080 source (screenshot or video). `keys` are [frame, crop rect in
 * source pixels]; the crop is fitted into `box`. Children are overlays in source coordinates, so
 * highlight boxes stay glued to the UI while the camera moves.
 */
export const Shot: React.FC<{
	src?: string;
	media?: React.ReactNode;
	keys: Key[];
	box: Rect;
	radius?: number;
	border?: boolean;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}> = ({src, media, keys, box, radius = 14, border = true, children, style}) => {
	const f = useCurrentFrame();
	const [x, y, w, h] = camAt(f, keys);
	const [bx, by, bw, bh] = box;
	const s = Math.max(bw / w, bh / h);
	return (
		<div
			style={{
				position: 'absolute',
				left: bx,
				top: by,
				width: bw,
				height: bh,
				overflow: 'hidden',
				borderRadius: radius,
				boxShadow: border ? `0 0 0 1px ${C.line}, 0 40px 120px rgba(0,0,0,0.55)` : undefined,
				backgroundColor: '#121110',
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
					transformOrigin: '0 0',
					translate: `${bw / 2 - (x + w / 2) * s}px ${bh / 2 - (y + h / 2) * s}px`,
					scale: String(s),
				}}
			>
				{media ?? <Img src={staticFile(src!)} style={{width: 1920, height: 1080, display: 'block'}} />}
				{children}
			</div>
		</div>
	);
};

/** Highlight (in source coordinates): dims everything else and draws an amber frame. */
export const Hl: React.FC<{at: number; until?: number; rect: Rect; dim?: number; color?: string; label?: string; labelSide?: 'top' | 'bottom'}> = ({
	at,
	until = 1e9,
	rect,
	dim = 0.55,
	color = C.amber,
	label,
	labelSide = 'top',
}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [at, at + 14, until, until + 12], [0, 1, 1, 0], {...clamp, easing: ease});
	if (p <= 0) return null;
	const [x, y, w, h] = rect;
	const grow = (1 - p) * 14;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - 8 - grow,
				top: y - 8 - grow,
				width: w + 16 + grow * 2,
				height: h + 16 + grow * 2,
				borderRadius: 10,
				border: `3px solid ${color}`,
				opacity: p,
				boxShadow: `0 0 0 4000px rgba(8,7,6,${dim * p}), 0 0 40px ${color}55`,
			}}
		>
			{label ? (
				<div
					style={{
						position: 'absolute',
						left: -3,
						[labelSide === 'top' ? 'bottom' : 'top']: 'calc(100% + 10px)',
						background: color,
						color: C.ink,
						fontFamily: F.mono,
						fontWeight: 700,
						fontSize: 20,
						letterSpacing: '0.12em',
						padding: '6px 12px',
						borderRadius: 4,
						whiteSpace: 'nowrap',
					}}
				>
					{label}
				</div>
			) : null}
		</div>
	);
};

/** Honest playback-speed badge for sped-up footage. */
export const Badge: React.FC<{children: React.ReactNode; at?: number; style?: React.CSSProperties}> = ({children, at = 6, style}) => {
	const p = useIn(at, 14);
	return (
		<div
			style={{
				position: 'absolute',
				right: 120,
				top: 50,
				fontFamily: F.mono,
				fontSize: 20,
				letterSpacing: '0.16em',
				color: C.text,
				background: 'rgba(15,14,12,0.85)',
				border: `1px solid ${C.line}`,
				padding: '8px 14px',
				borderRadius: 6,
				opacity: p,
				display: 'flex',
				alignItems: 'center',
				gap: 10,
				...style,
			}}
		>
			<span style={{width: 10, height: 10, borderRadius: 5, background: C.coral}} />
			{children}
		</div>
	);
};

/** Crop part of a 1920×1080 still (e.g. a headshot from the real UI). */
export const Crop: React.FC<{src: string; rect: Rect; size: number; radius?: number; style?: React.CSSProperties}> = ({src, rect, size, radius = 10, style}) => {
	const [x, y, w] = rect;
	const s = size / w;
	return (
		<div style={{width: size, height: (rect[3] / w) * size, overflow: 'hidden', borderRadius: radius, position: 'relative', flexShrink: 0, ...style}}>
			<Img src={staticFile(src)} style={{position: 'absolute', width: 1920 * s, height: 1080 * s, left: -x * s, top: -y * s, maxWidth: 'none'}} />
		</div>
	);
};

/** Small caption under footage that says where it comes from. */
export const Source: React.FC<{children: React.ReactNode; at?: number; paper?: boolean; style?: React.CSSProperties}> = ({children, at = 10, paper, style}) => {
	const p = useIn(at, 16);
	return (
		<div
			style={{
				position: 'absolute',
				fontFamily: F.mono,
				fontSize: 18,
				letterSpacing: '0.08em',
				color: paper ? C.inkMuted : C.dim,
				opacity: p,
				...style,
			}}
		>
			{children}
		</div>
	);
};

// ─── Ruko additions ─────────────────────────────────────────────────────────

type PKey = [number, number, number, number]; // [frame, scrollY (css px), zoom, focusY (viewport css px)]
const pAt = (f: number, keys: PKey[]) => {
	if (f <= keys[0][0]) return keys[0].slice(1) as [number, number, number];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (f <= b[0]) {
			const t = interpolate(f, [a[0], b[0] + 0.0001], [0, 1], {...clamp, easing: glide});
			return [1, 2, 3].map((j) => a[j] + (b[j] - a[j]) * t) as [number, number, number];
		}
	}
	return keys[keys.length - 1].slice(1) as [number, number, number];
};

/**
 * A phone showing REAL full-page captures (430 css px wide, @3x) of the running app.
 * shots crossfade in at their frame; keys move the page (scroll) and the camera (zoom around a
 * viewport point). Children are overlays (e.g. <Hl>) in page CSS coordinates of the capture.
 * Camera keys are interpolated with ONE easing; keep moves few and slow.
 */
export const Phone: React.FC<{
	shots: {src: string; at: number; cut?: boolean}[];
	keys: PKey[];
	cx?: number; // phone centre x on the canvas
	k?: number; // base css→film scale
	light?: boolean;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}> = ({shots, keys, cx = 600, k = 0.84, light, children, style}) => {
	const f = useCurrentFrame();
	const [scroll, z, fy] = pAt(f, keys);
	const s = k * z;
	const top = 104; // the phone region spans y 104..911: below the kicker/source line, above the captions
	const regionH = 807;
	const cy = regionH / 2;
	// screen point (215, fy) sits at (cx, cy) in the region
	const ox = cx - 215 * s;
	const oy = cy - fy * s;
	const bez = 15;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top,
				width: 1920,
				height: regionH,
				overflow: 'hidden',
				WebkitMaskImage: 'linear-gradient(to bottom, #000 0, #000 calc(100% - 46px), transparent 100%)',
				maskImage: 'linear-gradient(to bottom, #000 0, #000 calc(100% - 46px), transparent 100%)',
				...style,
			}}
		>
			<div style={{position: 'absolute', left: ox, top: oy, width: 430, height: 932, transformOrigin: '0 0', scale: String(s)}}>
				{/* device */}
				<div
					style={{
						position: 'absolute',
						left: -bez,
						top: -bez,
						width: 430 + bez * 2,
						height: 932 + bez * 2,
						borderRadius: 62,
						background: 'linear-gradient(160deg, #2a2e33 0%, #121417 45%, #1d2125 100%)',
						boxShadow: '0 0 0 2px #3a3f45, 0 50px 140px rgba(0,0,0,0.6)',
					}}
				/>
				<div style={{position: 'absolute', left: -bez - 3, top: 190, width: 4, height: 70, borderRadius: 2, background: '#3a3f45'}} />
				<div style={{position: 'absolute', left: 430 + bez - 1, top: 230, width: 4, height: 110, borderRadius: 2, background: '#3a3f45'}} />
				<div style={{position: 'absolute', inset: 0, borderRadius: 48, overflow: 'hidden', background: light ? C.paper : C.bg2}}>
					<div style={{position: 'absolute', left: 0, top: -scroll, width: 430}}>
						{shots.map((sh, i) => {
							// a `cut` shot: everything before it dips out (6f), the camera jumps, the new state fades in
							const nextCut = shots.slice(i + 1).find((x) => x.cut);
							const out = nextCut ? interpolate(f, [nextCut.at - 6, nextCut.at], [1, 0], clamp) : 1;
							const o = interpolate(f, [sh.at, sh.at + (sh.cut ? 8 : 10)], [0, 1], {...clamp, easing: ease}) * out;
							return o > 0 ? (
								<Img key={sh.src} src={staticFile(sh.src)} style={{position: 'absolute', left: 0, top: 0, width: 430, display: 'block', opacity: o}} />
							) : null;
						})}
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};

/** A block in the right-hand column, visible between two frames. */
export const Beat: React.FC<{from: number; to?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({from, to = 1e9, children, style}) => {
	const f = useCurrentFrame();
	const i = interpolate(f, [from, from + 16], [0, 1], {...clamp, easing: ease});
	const o = interpolate(f, [to - 10, to], [1, 0], {...clamp, easing: glide});
	const p = Math.min(i, o);
	if (p <= 0) return null;
	return <div style={{position: 'absolute', opacity: p, translate: `0 ${(1 - i) * 26}px`, ...style}}>{children}</div>;
};

/** Small tracked-caps label. */
export const Tag: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.muted, style}) => (
	<div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

/** The app's own mark: a raised palm in a circle (components/Header.tsx). */
export const Mark: React.FC<{size: number; bg?: string; fg?: string}> = ({size, bg = C.accent, fg = '#08191c'}) => (
	<svg viewBox="0 0 40 40" width={size} height={size}>
		<circle cx="20" cy="20" r="19" fill={bg} />
		<path
			d="M14.5 21.5v-6a1.6 1.6 0 0 1 3.2 0v4.5-7.5a1.6 1.6 0 0 1 3.2 0V20v-6.5a1.6 1.6 0 0 1 3.2 0V20v-4a1.6 1.6 0 0 1 3.2 0v8.2c0 4.4-3.2 7.3-7 7.3-2.6 0-4.4-1.2-5.8-3.3l-2.7-4.2a1.6 1.6 0 0 1 2.6-1.8z"
			fill={fg}
		/>
	</svg>
);
