import {Composition} from 'remotion';
import {Portfolio, FPS, DURATION} from './Portfolio';

export const RemotionRoot = () => (
  <Composition id="Portfolio" component={Portfolio} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
