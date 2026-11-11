import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {Backdrop, Mark} from './ui';
import {C, F} from './theme';

// Thumbnail (YouTube 16:9, Devpost 3:2). The phone screen is the real capture of the
// digital-arrest sample call at Danger (public/shots/da_end.png), not a mock-up.
export const Thumb: React.FC = () => {
	const {width: w, height: h} = useVideoConfig();
	const u = Math.min(h / 720, w / 1280);
	const screenW = 400 * u;
	const bez = 14 * u;
	return (
		<AbsoluteFill>
			<Backdrop glow="radial-gradient(ellipse 45% 70% at 78% 60%, rgba(179,38,30,0.42) 0%, rgba(0,0,0,0) 70%)" />
			<div style={{position: 'absolute', left: 64 * u, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16 * u}}>
					<Mark size={62 * u} />
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 62 * u, color: C.text, lineHeight: 1}}>Ruko</div>
				</div>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 112 * u, lineHeight: 0.98, color: C.text, marginTop: 40 * u, letterSpacing: '-0.01em'}}>
					Scam call?
				</div>
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 70 * u, lineHeight: 1.05, color: C.accent, marginTop: 18 * u}}>
					Ruko hears it live.
				</div>
				<div style={{fontFamily: F.text, fontWeight: 600, fontSize: 28 * u, color: C.muted, marginTop: 34 * u, letterSpacing: '0.02em'}}>
					English · <span style={{fontFamily: F.deva}}>हिंदी</span> · US &amp; India
				</div>
			</div>
			{/* phone, bleeding off the bottom edge */}
			<div style={{position: 'absolute', left: w - screenW - 70 * u, top: 70 * u, width: screenW, height: h, rotate: '4deg'}}>
				<div
					style={{
						position: 'absolute',
						left: -bez,
						top: -bez,
						right: -bez,
						bottom: -bez,
						borderRadius: 58 * u,
						background: 'linear-gradient(160deg, #2a2e33 0%, #121417 45%, #1d2125 100%)',
						boxShadow: `0 0 0 ${2 * u}px #3a3f45, 0 ${40 * u}px ${120 * u}px rgba(0,0,0,0.7)`,
					}}
				/>
				<div style={{position: 'absolute', inset: 0, borderRadius: 46 * u, overflow: 'hidden', background: C.bg2}}>
					<Img src={staticFile('shots/da_end.png')} style={{width: '100%', display: 'block'}} />
				</div>
			</div>
		</AbsoluteFill>
	);
};
