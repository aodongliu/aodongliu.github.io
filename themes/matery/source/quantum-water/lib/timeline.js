// Continuous playback clock over discrete frames. Ping-pong (forward then time-reversed)
// so the 0..N-1 segment loops without a jump; speed in source frames per second.
export class Timeline {
  constructor(frameCount, { framesPerSecond = 30, mode = 'pingpong', period = frameCount } = {}) {
    this.n = frameCount; this.period = period; this.fps = framesPerSecond; this.mode = mode;
    this.t = 0; this.playing = true; this.fixed = null;
  }
  // `limit`: last frame index whose data is available (streaming); the clock waits at the edge
  tick(dt) {
    if (!this.playing || this.fixed !== null) return;
    if (this.limit != null && this.frameAt(this.t + dt) > this.limit && this.frameAt(this.t) <= this.limit) return;
    this.t += dt;
  }
  set(frame) { this.fixed = frame; }
  get frame() { return this.fixed !== null ? this.fixed : this.frameAt(this.t); }
  frameAt(time) {
    const span = this.n - 1, s = time * this.fps;
    if (this.mode === 'periodic') return s % this.period;     // seamless: data holds one closed period
    if (this.mode === 'loop') return s % span;
    const p = s % (2 * span);
    return p <= span ? p : 2 * span - p;
  }
}
