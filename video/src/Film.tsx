import React from 'react';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {TL} from './timeline';
import {Captions} from './Captions';
import {Cold} from './scenes/Cold';
import {Problem} from './scenes/Problem';
import {Reveal} from './scenes/Reveal';
import {Demo} from './scenes/Demo';
import {Bank, Check, Irs} from './scenes/Calls';
import {Close, How, Proof, Trust} from './scenes/Built';

// Scene id (narration.json) -> component. One component per scene; add yours here.
const SCENES: Record<string, React.FC> = {
	cold: Cold,
	problem: Problem,
	reveal: Reveal,
	demo: Demo,
	irs: Irs,
	bank: Bank,
	check: Check,
	how: How,
	proof: Proof,
	trust: Trust,
	close: Close,
};

// Transition INTO a scene. Fades by default; use a wipe only at the story's turns (≤2 per film).
const INTO: Record<string, 'fade' | 'wipe'> = {problem: 'wipe', how: 'wipe'};

export const Film: React.FC<{captions: boolean}> = ({captions}) => {
	const timing = linearTiming({durationInFrames: TL.transition});
	return (
		<AbsoluteFill style={{backgroundColor: '#0d0f11'}}>
			<TransitionSeries>
				{TL.scenes.flatMap((s, i) => {
					const Scene = SCENES[s.id];
					if (!Scene) throw new Error(`No component registered for scene "${s.id}" in Film.tsx`);
					const seq = (
						<TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.dur}>
							<Scene />
						</TransitionSeries.Sequence>
					);
					if (i === 0) return [seq];
					const kind = INTO[s.id] ?? 'fade';
					return [
						<TransitionSeries.Transition
							key={`t-${s.id}`}
							presentation={(kind === 'wipe' ? wipe({direction: 'from-left'}) : fade()) as ReturnType<typeof fade>}
							timing={timing}
						/>,
						seq,
					];
				})}
			</TransitionSeries>

			{captions ? <Captions /> : null}

			{TL.lines.map((l) => (
				<Sequence key={l.id} name={`vo ${l.id}`} from={l.from} durationInFrames={l.dur + 6} layout="none">
					<Audio src={staticFile(l.src)} />
				</Sequence>
			))}
			<Audio name="music + sfx" src={staticFile('audio/bed.wav')} />
		</AbsoluteFill>
	);
};
