import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Beat, Hl, Kicker, Phone, Rise, Source, Tag} from '../ui';
import {C, F} from '../theme';
import {E, L, W} from '../timeline';
import {PX, Quote} from './Demo';

// IRS sample call, final state (capture/irs_07a.txt).
export const Irs: React.FC = () => {
	const s = L('i3');
	return (
		<AbsoluteFill>
			<Backdrop glow="radial-gradient(ellipse 38% 60% at 31% 50%, rgba(255,143,134,0.06) 0%, rgba(0,0,0,0) 70%)" />
			<Kicker n="02">SAME SCRIPT, OHIO</Kicker>
			<Source style={{right: 120, top: 60}}>REAL CAPTURE · /listen · SAMPLE CALL “IRS BACK-TAXES THREAT”</Source>
			<Phone
				shots={[{src: 'shots/irs_07a.png', at: 0}]}
				keys={[
					[0, 1440, 1.1, 400],
					[60, 1440, 1.32, 356],
					[s - 16, 1440, 1.32, 356],
					[s + 6, 700, 1.4, 273],
				]}
			>
				<Hl at={W('i1', 'gift') - 6} until={s - 18} rect={[18, 1649, 394, 294]} label="GIFT CARDS" color={C.danger} />
				<Hl at={s + 8} rect={[18, 879, 394, 188]} label="SAY THIS" />
			</Phone>
			<Beat from={4} to={s - 4} style={{left: PX, top: 230, width: 680}}>
				<Tag color={C.danger}>Red flag</Tag>
				<div style={{fontFamily: F.text, fontWeight: 700, fontSize: 36, color: C.text, marginTop: 16}}>Demands gift cards, crypto or wire transfer</div>
				<Quote size={44} color={C.muted}>
					“…settle the balance right now with Apple gift cards. Buy four cards and read me the numbers on the back.”
				</Quote>
			</Beat>
			<Beat from={s} style={{left: PX, top: 260, width: 680}}>
				<Tag color={C.accent}>Say this</Tag>
				<Quote size={60}>“I am not paying anything over the phone, and I am hanging up now.”</Quote>
			</Beat>
		</AbsoluteFill>
	);
};

const PRow: React.FC<{at: number; k: string; v: string; color: string}> = ({at, k, v, color}) => (
	<Rise at={at} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '20px 0', borderTop: `2px solid ${C.paperLine}`}}>
		<span style={{fontFamily: F.text, fontWeight: 600, fontSize: 32, color: C.inkMuted}}>{k}</span>
		<span style={{fontFamily: F.display, fontWeight: 700, fontSize: 44, color, whiteSpace: 'nowrap'}}>{v}</span>
	</Rise>
);

// The real bank call, final state (capture/bank_end.txt): no red flags, no hang-up banner, meter 35 "Be careful".
export const Bank: React.FC = () => {
	const flags = W('b2', 'red') - 10;
	const gentle = W('b2', 'gentle') - 8;
	return (
		<AbsoluteFill>
			<Backdrop paper />
			<Kicker paper n="03">NO FALSE ALARM</Kicker>
			<Source paper style={{right: 120, top: 60}}>REAL CAPTURE · /listen · SAMPLE CALL “REAL BANK CALL (NO SCAM)”</Source>
			<Phone
				light
				shots={[{src: 'shots/bank_end.png', at: 0}]}
				keys={[
					[0, 0, 1.15, 330],
					[flags - 18, 0, 1.25, 300],
					[flags + 4, 760, 1.3, 221],
					[gentle - 16, 760, 1.3, 221],
					[gentle + 4, 0, 1.3, 260],
				]}
			>
				<Hl at={flags + 6} until={gentle - 18} rect={[18, 926, 394, 110]} label="RED FLAGS · NONE" color={C.teal} dim={0.35} />
				<Hl at={gentle + 6} rect={[18, 131, 394, 258]} label="35 · BE CAREFUL" color={C.cautionInk} dim={0.35} />
			</Phone>
			<Beat from={6} style={{left: PX, top: 220, width: 660}}>
				<Tag color={C.inkMuted}>Real bank call · no scam</Tag>
				<Quote size={40} color={C.ink}>
					“…the bank will never ask for your PIN, OTP or card number over a call.”
				</Quote>
				<div style={{marginTop: 34}}>
					<PRow at={flags} k="Red flags" v="none" color={C.safeInk} />
					<PRow at={W('b2', 'warning') - 6} k="Hang-up warning" v="none" color={C.safeInk} />
					<PRow at={gentle} k="On-device rules" v="0 · Looks safe" color={C.safeInk} />
					<PRow at={gentle + 8} k="Claude" v="35 · Be careful" color={C.cautionInk} />
				</div>
			</Beat>
		</AbsoluteFill>
	);
};

// /check with a fake "electricity disconnected" SMS (capture/check_01.txt → check_03.txt).
export const Check: React.FC = () => {
	const v = W('k1', 'same') - 6;
	return (
		<AbsoluteFill>
			<Backdrop paper />
			<Kicker paper n="04">CHECK A MESSAGE</Kicker>
			<Source paper style={{right: 120, top: 60}}>REAL CAPTURE · /check</Source>
			<Phone
				light
				shots={[
					{src: 'shots/check_01.png', at: 0},
					{src: 'shots/check_03.png', at: v, cut: true},
				]}
				keys={[
					[0, 0, 1.15, 383],
					[v - 1, 0, 1.25, 383],
					[v, 500, 1.1, 402],
				]}
			>
				<Hl at={W('k1', 'paste') - 4} until={v - 8} rect={[18, 230, 394, 306]} label="PASTED" color={C.teal} dim={0.35} />
				<Hl at={v + 10} rect={[18, 976, 394, 258]} label="62 · LIKELY A SCAM" color={C.dangerInk} dim={0.35} />
			</Phone>
			<Beat from={4} style={{left: PX, top: 240, width: 660}}>
				<Tag color={C.inkMuted}>Fake SMS</Tag>
				<Quote size={40} color={C.ink}>
					“…your electricity power will be disconnected tonight at 9.30 pm… immediately contact our electricity officer…”
				</Quote>
				<Rise at={v} style={{marginTop: 30, display: 'flex', alignItems: 'baseline', gap: 20}}>
					<span style={{fontFamily: F.display, fontWeight: 700, fontSize: 100, color: C.dangerInk}}>62</span>
					<span style={{fontFamily: F.text, fontWeight: 700, fontSize: 36, color: C.dangerInk}}>Likely a scam</span>
				</Rise>
				<Rise at={v + 14} style={{fontFamily: F.text, fontSize: 26, color: C.inkMuted, marginTop: 6}}>
					Claude answered in 4.8 s on this capture
				</Rise>
			</Beat>
		</AbsoluteFill>
	);
};

