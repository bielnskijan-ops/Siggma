/**
 * KOZMINSKI ESCAPE: POLOWANIE NA ECTS
 * js/audio.js - Moduł syntezy dźwięków 8-bit retro (Web Audio API)
 * Bez zewnętrznych plików .mp3 / .wav - 100% czysty kod i synteza proceduralna
 */

const SoundSystem = {
  ctx: null,
  isMuted: false,

  /**
   * Inicjalizacja kontekstu audio (AudioContext).
   * Powinna być wywołana po pierwszej interakcji użytkownika (np. kliknięciu Start).
   */
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  /**
   * Wyciszenie / włączenie dźwięków
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  },

  /**
   * Odtwarzanie syntetyzowanego efektu dźwiękowego
   * @param {'ects' | 'coffee' | 'shield' | 'freeze' | 'hit' | 'win'} type 
   */
  play(type) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      // 1. 'ects': melodyjny dwuton monety (fala trójkątna)
      case 'ects': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'triangle';

        // Klasyczny dwuton zręcznościowy retro coin: B5 (987.77 Hz) -> E6 (1318.51 Hz)
        osc1.frequency.setValueAtTime(987.77, now);
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.25, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.08);

        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
        break;
      }

      // 2. 'coffee': dźwięk przyspieszenia (rosnąca częstotliwość fali piłokształtnej)
      case 'coffee': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Rosnący sweep od 160 Hz do 950 Hz
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.38);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      // 3. 'shield': aktywacja legitymacji studenckiej (akord sinusoidalny)
      case 'shield': {
        // Czysty, wzniosły akord dur (C5, E5, G5)
        const chordFreqs = [523.25, 659.25, 783.99];
        const masterGain = this.ctx.createGain();

        masterGain.gain.setValueAtTime(0.01, now);
        masterGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        masterGain.connect(this.ctx.destination);

        chordFreqs.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.65);
        });
        break;
      }

      // 4. 'freeze': cyber-freeze AI po zadanym pytaniu (fala prostokątna)
      case 'freeze': {
        // Cyfrowy glitch / staccato fala prostokątna
        const freqs = [800, 400, 1200, 300, 950];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.045);

          gain.gain.setValueAtTime(0.12, now + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.04);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.045);
          osc.stop(now + idx * 0.045 + 0.045);
        });
        break;
      }

      // 5. 'hit': złapanie przez egzaminatora (dramatycznie opadający bas)
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Dramatyczny zjazd basu od 240 Hz do 35 Hz
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.55);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
        break;
      }

      // 6. 'win': krótka, 4-tonowa fanfara sukcesu
      case 'win': {
        // Triumfalna fanfara: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
        const notes = [
          { f: 523.25, time: 0.00, dur: 0.12 },
          { f: 659.25, time: 0.11, dur: 0.12 },
          { f: 783.99, time: 0.22, dur: 0.12 },
          { f: 1046.50, time: 0.33, dur: 0.45 }
        ];

        notes.forEach((note) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, now + note.time);

          gain.gain.setValueAtTime(0.22, now + note.time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur + 0.05);
        });
        break;
      }

      default:
        console.warn(`Nieznany typ dźwięku w SoundSystem: ${type}`);
    }
  }
};

// Eksport globalny do obiektu window dla przeglądarki
window.SoundSystem = SoundSystem;
