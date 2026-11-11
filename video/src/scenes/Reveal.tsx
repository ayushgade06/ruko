import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop, Mark, Reveal as Up, useIn} from '../ui';
import {C, F, ease} from '../theme';
import {L, W} from '../timeline';

export const Reveal: React.FC = () => {
	const f = useCurrentFrame();
	const a = W('r1', 'rooko') - 4;
	const m = useIn(0, 30);
	const glow = interpolate(f, [a, a + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	return (
		<AbsoluteFill>
			<Backdrop glow={`radial-gradient(ellipse 40% 40% at 50% 42%, rgba(108,192,207,${0.06 + 0.1 * glow}) 0%, rgba(0,0,0,0) 70%)`} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 110}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 40}}>
					<div style={{scale: String(0.6 + 0.4 * m), opacity: m, rotate: `${(1 - m) * -12}deg`}}>
						<Mark size={190} />
					</div>
					<div>
						<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 230, lineHeight: 0.85, color: C.text, letterSpacing: '-0.01em'}}>
							<Up at={a}>Ruko</Up>
						</div>
						<div style={{fontFamily: F.deva, fontSize: 54, color: C.muted, marginTop: 14}}>
							<Up at={W('r1', 'hindi') - 2}>
								<span lang="hi">रुको</span> · <span style={{color: C.accent}}>wait</span>
							</Up>
						</div>
					</div>
				</div>
				<div style={{fontFamily: F.display, fontWeight: 600, fontSize: 64, color: C.text, marginTop: 70, textAlign: 'center'}}>
					<Up at={L('r2')}>A calm second voice in the room,</Up>{' '}
					<Up at={W('r2', 'during') - 2} style={{color: C.accent}}>
						during the call.
					</Up>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
