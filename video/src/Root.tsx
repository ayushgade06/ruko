import React from 'react';
import {Composition, Still} from 'remotion';
import {Film} from './Film';
import {Thumb} from './Thumb';
import {TL} from './timeline';
import './theme';

export const Root: React.FC = () => (
	<>
		<Composition id="Film" component={Film} durationInFrames={TL.total} fps={TL.fps} width={1920} height={1080} defaultProps={{captions: true}} />
		<Still id="ThumbYT" component={Thumb} width={1280} height={720} />
		<Still id="ThumbDevpost" component={Thumb} width={1500} height={1000} />
	</>
);
