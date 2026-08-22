class AudioManager {
  constructor() {
    this.ctx = null
    this.gain = null
    this.source = null
    this.muted = false
  }

  resetClosedContext() {
    if (this.ctx?.state === 'closed') {
      this.ctx = null
      this.gain = null
      this.source = null
    }
  }

  async ensureUnlocked() {
    try {
      this.resetClosedContext()

      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (!AudioContextClass) return false
        this.ctx = new AudioContextClass()
      }

      if (this.ctx.state !== 'running') {
        await this.ctx.resume()
      }

      return this.ctx.state === 'running'
    } catch (error) {
      console.warn('Audio unlock blocked by browser', error)
      return false
    }
  }

  async startAmbience() {
    const unlocked = await this.ensureUnlocked()
    if (!unlocked || !this.ctx) return false

    if (!this.source) {
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0

      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1
        last = (last + 0.025 * white) / 1.025
        data[i] = last * 3.2
      }

      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const lowpass = this.ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 950

      const highpass = this.ctx.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 80

      const gain = this.ctx.createGain()
      gain.gain.value = this.muted ? 0 : 0.035

      source.connect(lowpass).connect(highpass).connect(gain).connect(this.ctx.destination)
      source.start()

      this.source = source
      this.gain = gain
    }

    this.muted = false
    if (this.gain && this.ctx) this.gain.gain.setTargetAtTime(0.035, this.ctx.currentTime, 0.2)
    return true
  }

  async setMuted(muted) {
    this.muted = muted

    if (!muted) {
      const unlocked = await this.ensureUnlocked()
      if (!unlocked) return false
      if (!this.source) return this.startAmbience()
    }

    if (this.gain && this.ctx) {
      this.gain.gain.setTargetAtTime(muted ? 0 : 0.035, this.ctx.currentTime, muted ? 0.12 : 0.2)
    }

    return true
  }

  snort() {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running' || this.muted) return

    try {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 260

      const gain = ctx.createGain()
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.34, now + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.018, now + 0.9)

      source.connect(filter).connect(gain).connect(ctx.destination)
      source.start(now)
    } catch (error) {
      console.warn('Tiger sound unavailable', error)
    }
  }

  async destroy() {
    try {
      this.source?.stop?.()
    } catch {
      // Source may already be stopped.
    }

    this.source = null
    this.gain = null

    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        await this.ctx.close()
      } catch (error) {
        console.warn('Audio context cleanup failed', error)
      }
    }

    this.ctx = null
  }
}

export const audioService = new AudioManager()
