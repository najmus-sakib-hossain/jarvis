"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type AudioFormat =
  | "mp3"
  | "mpeg"
  | "opus"
  | "ogg"
  | "oga"
  | "wav"
  | "aac"
  | "caf"
  | "m4a"
  | "m4b"
  | "mp4"
  | "weba"
  | "webm"
  | "dolby"
  | "flac";

type SoundState = "unloaded" | "loading" | "loaded";
type AudioState = "suspended" | "running" | "suspending";

interface SoundSprite {
  [key: string]: [number, number] | [number, number, boolean];
}

interface SoundOptions {
  src: string | string[];
  autoplay?: boolean;
  format?: AudioFormat | AudioFormat[];
  html5?: boolean;
  loop?: boolean;
  mute?: boolean;
  pool?: number;
  preload?: boolean | "metadata";
  rate?: number;
  sprite?: SoundSprite;
  volume?: number;
  xhr?: {
    method?: string;
    headers?: Record<string, string>;
    withCredentials?: boolean;
  };
  onend?: (id: number) => void;
  onfade?: (id: number) => void;
  onload?: () => void;
  onloaderror?: (id: number | null, error: any) => void;
  onplayerror?: (id: number, error: any) => void;
  onpause?: (id: number) => void;
  onplay?: (id: number) => void;
  onstop?: (id: number) => void;
  onmute?: (id: number) => void;
  onvolume?: (id: number) => void;
  onrate?: (id: number) => void;
  onseek?: (id: number) => void;
  onunlock?: () => void;
  onresume?: () => void;
}

interface EventListener {
  id?: number;
  fn: (...args: any[]) => void;
  once?: boolean;
}

const cache: { [key: string]: AudioBuffer } = {};

class SoundGlobal {
  private static instance: SoundGlobal;
  _counter = 1000;
  _html5AudioPool: HTMLAudioElement[] = [];
  html5PoolSize = 10;
  _codecs: { [key: string]: boolean } = {};
  _sounds: Sound[] = [];
  _muted = false;
  _volume = 1;
  _canPlayEvent = "canplaythrough";
  _navigator =
    typeof window !== "undefined" && window.navigator ? window.navigator : null;
  masterGain: GainNode | null = null;
  noAudio = false;
  usingWebAudio = true;
  autoSuspend = true;
  ctx: AudioContext | null = null;
  autoUnlock = true;
  state: AudioState = "suspended";
  private _audioUnlocked = false;
  private _mobileUnloaded = false;
  private _scratchBuffer: AudioBuffer | null = null;
  private _suspendTimer: number | null = null;
  private _resumeAfterSuspend = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): SoundGlobal {
    if (!SoundGlobal.instance) {
      SoundGlobal.instance = new SoundGlobal();
    }
    return SoundGlobal.instance;
  }

  init(): this {
    this._setup();
    return this;
  }

  volume(vol?: number): number | this {
    if (!this.ctx) {
      this.setupAudioContext();
    }

    if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
      this._volume = vol;

      if (this._muted) {
        return this;
      }

      if (this.usingWebAudio && this.masterGain) {
        this.masterGain.gain.setValueAtTime(vol, this.ctx!.currentTime);
      }

      for (const sound of this._sounds) {
        if (!sound._webAudio) {
            sound.volume(sound.volume(), undefined);
        }
      }

      return this;
    }

    return this._volume;
  }

  mute(muted: boolean): this {
    if (!this.ctx) {
      this.setupAudioContext();
    }

    this._muted = muted;

    if (this.usingWebAudio && this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this._volume,
        this.ctx!.currentTime
      );
    }

    for (const sound of this._sounds) {
      if (!sound._webAudio) {
        sound.mute(muted, undefined);
      }
    }

    return this;
  }

  stop(): this {
    for (const sound of this._sounds) {
      sound.stop();
    }
    return this;
  }

  unload(): this {
    for (let i = this._sounds.length - 1; i >= 0; i--) {
      this._sounds[i].unload();
    }

    if (this.usingWebAudio && this.ctx && this.ctx.close) {
      this.ctx.close();
      this.ctx = null;
      this.setupAudioContext();
    }

    return this;
  }

  codecs(ext: string): boolean {
    return this._codecs[ext.replace(/^x-/, "")];
  }

  private _setup(): this {
    this.state = this.ctx ? this.ctx.state || "suspended" : "suspended";
    this._autoSuspend();

    if (!this.usingWebAudio) {
      if (typeof Audio !== "undefined") {
        try {
          const test = new Audio();
          if (typeof test.oncanplaythrough === "undefined") {
            this._canPlayEvent = "canplay";
          }
        } catch (e) {
          this.noAudio = true;
        }
      } else {
        this.noAudio = true;
      }
    }

    try {
      if (new Audio().muted) {
        this.noAudio = true;
      }
    } catch (e) {}

    if (!this.noAudio) {
      this._setupCodecs();
    }

    return this;
  }

  private _setupCodecs(): this {
    let audioTest: HTMLAudioElement | null = null;
    try {
      audioTest = typeof Audio !== "undefined" ? new Audio() : null;
    } catch (err) {
      return this;
    }

    if (!audioTest || typeof audioTest.canPlayType !== "function") {
      return this;
    }

    const mpegTest = audioTest.canPlayType("audio/mpeg;").replace(/^no$/, "");
    const ua = this._navigator ? this._navigator.userAgent : "";
    const checkOpera = ua.match(/OPR\/(\d+)/g);
    const isOldOpera =
      checkOpera && parseInt(checkOpera[0].split("/")[1], 10) < 33;
    const checkSafari =
      ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1;
    const safariVersion = ua.match(/Version\/(.*?) /);
    const isOldSafari =
      checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15;

    this._codecs = {
      mp3: !!(
        !isOldOpera &&
        (mpegTest || audioTest.canPlayType("audio/mp3;").replace(/^no$/, ""))
      ),
      mpeg: !!mpegTest,
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
      oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
      wav: !!(
        audioTest.canPlayType('audio/wav; codecs="1"') ||
        audioTest.canPlayType("audio/wav")
      ).replace(/^no$/, ""),
      aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
      caf: !!audioTest.canPlayType("audio/x-caf;").replace(/^no$/, ""),
      m4a: !!(
        audioTest.canPlayType("audio/x-m4a;") ||
        audioTest.canPlayType("audio/m4a;") ||
        audioTest.canPlayType("audio/aac;")
      ).replace(/^no$/, ""),
      m4b: !!(
        audioTest.canPlayType("audio/x-m4b;") ||
        audioTest.canPlayType("audio/m4b;") ||
        audioTest.canPlayType("audio/aac;")
      ).replace(/^no$/, ""),
      mp4: !!(
        audioTest.canPlayType("audio/x-mp4;") ||
        audioTest.canPlayType("audio/mp4;") ||
        audioTest.canPlayType("audio/aac;")
      ).replace(/^no$/, ""),
      weba: !!(
        !isOldSafari &&
        audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
      ),
      webm: !!(
        !isOldSafari &&
        audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
      ),
      dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
      flac: !!(
        audioTest.canPlayType("audio/x-flac;") ||
        audioTest.canPlayType("audio/flac;")
      ).replace(/^no$/, ""),
    };

    return this;
  }

  private _unlockAudio(): this {
    if (this._audioUnlocked || !this.ctx) {
      return this;
    }

    this._audioUnlocked = false;
    this.autoUnlock = false;

    if (!this._mobileUnloaded && this.ctx.sampleRate !== 44100) {
      this._mobileUnloaded = true;
      this.unload();
    }

    this._scratchBuffer = this.ctx.createBuffer(1, 1, 22050);

    const unlock = () => {
      while (this._html5AudioPool.length < this.html5PoolSize) {
        try {
          const audioNode = new Audio();
          (audioNode as any)._unlocked = true;
          this._releaseHtml5Audio(audioNode);
        } catch (e) {
          this.noAudio = true;
          break;
        }
      }

      for (const sound of this._sounds) {
        if (!sound._webAudio) {
          sound._unlockNodes();
        }
      }

      this._autoResume();

      const source = this.ctx!.createBufferSource();
      source.buffer = this._scratchBuffer;
      source.connect(this.ctx!.destination);
      source.start(0);

      if (this.ctx!.resume) {
        this.ctx!.resume();
      }

      source.onended = () => {
        source.disconnect(0);
        this._audioUnlocked = true;
        document.removeEventListener("touchstart", unlock, true);
        document.removeEventListener("touchend", unlock, true);
        document.removeEventListener("click", unlock, true);
        document.removeEventListener("keydown", unlock, true);

        for (const sound of this._sounds) {
          sound._emit("unlock");
        }
      };
    };

    document.addEventListener("touchstart", unlock, true);
    document.addEventListener("touchend", unlock, true);
    document.addEventListener("click", unlock, true);
    document.addEventListener("keydown", unlock, true);

    return this;
  }

  _obtainHtml5Audio(): HTMLAudioElement {
    if (this._html5AudioPool.length) {
      return this._html5AudioPool.pop()!;
    }

    const testPlay = new Audio().play();
    if (
      testPlay &&
      typeof Promise !== "undefined" &&
      (testPlay instanceof Promise || typeof testPlay.then === "function")
    ) {
      testPlay.catch(() => {
        console.warn(
          "HTML5 Audio pool exhausted, returning potentially locked audio object."
        );
      });
    }

    return new Audio();
  }

  _releaseHtml5Audio(audio: HTMLAudioElement): this {
    if ((audio as any)._unlocked) {
      this._html5AudioPool.push(audio);
    }
    return this;
  }

  private _autoSuspend(): this {
    if (
      !this.autoSuspend ||
      !this.ctx ||
      !this.ctx.suspend ||
      !this.usingWebAudio
    ) {
      return this;
    }

    for (const sound of this._sounds) {
      if (sound._webAudio && sound.playing()) {
        return this;
      }
    }

    if (this._suspendTimer) {
      clearTimeout(this._suspendTimer);
    }

    this._suspendTimer = window.setTimeout(() => {
      if (!this.autoSuspend) {
        return;
      }
      this._suspendTimer = null;
      this.state = "suspending";
      const handleSuspension = () => {
        this.state = "suspended";
        if (this._resumeAfterSuspend) {
          delete (this as any)._resumeAfterSuspend;
          this._autoResume();
        }
      };
      this.ctx!.suspend().then(handleSuspension, handleSuspension);
    }, 30000);

    return this;
  }

  _autoResume(): this {
    if (!this.ctx || !this.ctx.resume || !this.usingWebAudio) {
      return this;
    }

    if (this.state === "running" && this.ctx.state !== "interrupted" && this._suspendTimer) {
      clearTimeout(this._suspendTimer);
      this._suspendTimer = null;
    } else if (this.state === "suspended" || (this.state === "running" && this.ctx.state === "interrupted")) {
      this.ctx.resume().then(() => {
        this.state = "running";
        for (const sound of this._sounds) {
          sound._emit("resume");
        }
      });
      if (this._suspendTimer) {
        clearTimeout(this._suspendTimer);
        this._suspendTimer = null;
      }
    } else if (this.state === "suspending") {
      this._resumeAfterSuspend = true;
    }

    return this;
  }

  setupAudioContext() {
    if (!this.usingWebAudio) {
      return;
    }

    try {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      this.usingWebAudio = false;
    }

    if (!this.ctx) {
      this.usingWebAudio = false;
    }

    const iOS = /iP(hone|od|ad)/.test(this._navigator?.platform ?? "");
    const appVersion = this._navigator?.appVersion.match(/OS (\d+)_/);
    const version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      const safari = /safari/.test(this._navigator?.userAgent.toLowerCase() ?? "");
      if (!safari) {
        this.usingWebAudio = false;
      }
    }

    if (this.usingWebAudio) {
      this.masterGain = this.ctx!.createGain();
      this.masterGain.gain.setValueAtTime(
        this._muted ? 0 : this._volume,
        this.ctx!.currentTime
      );
      this.masterGain.connect(this.ctx!.destination);
    }

    this._setup();
  }
}

class Sound {
  private _autoplay: boolean;
  private _format?: AudioFormat | AudioFormat[];
  _html5: boolean;
  private _muted: boolean;
  _loop: boolean;
  private _pool: number;
  private _preload: boolean | "metadata";
  _rate: number;
  _sprite: SoundSprite;
  _src: string | string[];
  _volume: number;
  private _xhr: SoundOptions["xhr"];

  _duration = 0;
  _state: SoundState = "unloaded";
  private _sounds: SoundInstance[] = [];
  private _endTimers: { [key: number]: number | (() => void) } = {};
  private _queue: { event: string; action: () => void }[] = [];
  private _playLock = false;

  private _onend: EventListener[] = [];
  private _onfade: EventListener[] = [];
  private _onload: EventListener[] = [];
  private _onloaderror: EventListener[] = [];
  private _onplayerror: EventListener[] = [];
  private _onpause: EventListener[] = [];
  private _onplay: EventListener[] = [];
  private _onstop: EventListener[] = [];
  private _onmute: EventListener[] = [];
  private _onvolume: EventListener[] = [];
  private _onrate: EventListener[] = [];
  private _onseek: EventListener[] = [];
  private _onunlock: EventListener[] = [];
  private _onresume: EventListener[] = [];

  _webAudio: boolean;
  private _soundGlobal: SoundGlobal;

  constructor(o: SoundOptions) {
    if (!o.src || o.src.length === 0) {
      console.error(
        "An array of source files must be passed with any new Sound."
      );
    }
    this._soundGlobal = SoundGlobal.getInstance();
    this.init(o);
    this._webAudio = this._soundGlobal.usingWebAudio && !this._html5;
  }

  private init(o: SoundOptions): this {
    if (!this._soundGlobal.ctx) {
      this._soundGlobal.setupAudioContext();
    }

    this._autoplay = o.autoplay || false;
    this._format = o.format;
    this._html5 = o.html5 || false;
    this._muted = o.mute || false;
    this._loop = o.loop || false;
    this._pool = o.pool || 5;
    this._preload =
      typeof o.preload === "boolean" || o.preload === "metadata"
        ? o.preload
        : true;
    this._rate = o.rate || 1;
    this._sprite = o.sprite || {};
    this._src = typeof o.src === "string" ? [o.src] : o.src;
    this._volume = o.volume !== undefined ? o.volume : 1;
    this._xhr = o.xhr;

    this._onend = o.onend ? [{ fn: o.onend }] : [];
    this._onfade = o.onfade ? [{ fn: o.onfade }] : [];
    this._onload = o.onload ? [{ fn: o.onload }] : [];
    this._onloaderror = o.onloaderror ? [{ fn: o.onloaderror }] : [];
    this._onplayerror = o.onplayerror ? [{ fn: o.onplayerror }] : [];
    this._onpause = o.onpause ? [{ fn: o.onpause }] : [];
    this._onplay = o.onplay ? [{ fn: o.onplay }] : [];
    this._onstop = o.onstop ? [{ fn: o.onstop }] : [];
    this._onmute = o.onmute ? [{ fn: o.onmute }] : [];
    this._onvolume = o.onvolume ? [{ fn: o.onvolume }] : [];
    this._onrate = o.onrate ? [{ fn: o.onrate }] : [];
    this._onseek = o.onseek ? [{ fn: o.onseek }] : [];
    this._onunlock = o.onunlock ? [{ fn: o.onunlock }] : [];

    this._webAudio = this._soundGlobal.usingWebAudio && !this._html5;

    if (this._soundGlobal.ctx && this._soundGlobal.autoUnlock) {
      this._soundGlobal["_unlockAudio"]();
    }

    this._soundGlobal._sounds.push(this);

    if (this._autoplay) {
      this._queue.push({
        event: "play",
        action: () => {
          this.play();
        },
      });
    }

    if (this._preload && this._preload !== "none") {
      this.load();
    }

    return this;
  }

  load(): this {
    let url: string | null = null;

    if (this._soundGlobal.noAudio) {
      this._emit(
        "loaderror",
        null,
        "No audio support."
      );
      return this;
    }

    if (typeof this._src === "string") {
      this._src = [this._src];
    }

    for (let i = 0; i < this._src.length; i++) {
      let ext: string | undefined;
      let str = this._src[i];

      if (this._format && (this._format as AudioFormat[])[i]) {
        ext = (this._format as AudioFormat[])[i];
      } else {
        if (typeof str !== "string") {
          this._emit(
            "loaderror",
            null,
            "Non-string found in selected audio sources - ignoring."
          );
          continue;
        }
        const extMatch = /^data:audio\/([^;,]+);/i.exec(str);
        if (!extMatch) {
          const fileMatch = /\.([^.]+)$/.exec(str.split("?", 1)[0]);
          if (fileMatch) {
            ext = fileMatch[1].toLowerCase();
          }
        } else {
          ext = extMatch[1].toLowerCase();
        }
      }

      if (!ext) {
        console.warn(
          'No file extension was found. Consider using the "format" property or specify an extension.'
        );
      }

      if (ext && this._soundGlobal.codecs(ext)) {
        url = str;
        break;
      }
    }

    if (!url) {
      this._emit(
        "loaderror",
        null,
        "No codec support for selected audio sources."
      );
      return this;
    }

    this._src = url;
    this._state = "loading";

    if (window.location.protocol === "https:" && url.slice(0, 5) === "http:") {
      this._html5 = true;
      this._webAudio = false;
    }

    new SoundInstance(this);

    if (this._webAudio) {
      this.loadBuffer();
    }

    return this;
  }

  play(sprite?: string | number, internal?: boolean): number | null {
    let id: number | null = null;

    if (typeof sprite === "number") {
      id = sprite;
      sprite = undefined;
    } else if (
      typeof sprite === "string" &&
      this._state === "loaded" &&
      !this._sprite[sprite]
    ) {
      return null;
    } else if (typeof sprite === "undefined") {
      sprite = "__default";
      if (!this._playLock) {
        let num = 0;
        for (const sound of this._sounds) {
          if (sound._paused && !sound._ended) {
            num++;
            id = sound._id;
          }
        }
        if (num === 1) {
          sprite = undefined;
        } else {
          id = null;
        }
      }
    }

    const sound = id ? this._soundById(id) : this._inactiveSound();

    if (!sound) {
      return null;
    }

    if (id && !sprite) {
      sprite = sound._sprite || "__default";
    }

    if (this._state !== "loaded") {
      sound._sprite = sprite as string;
      sound._ended = false;
      const soundId = sound._id;
      this._queue.push({
        event: "play",
        action: () => {
          this.play(soundId);
        },
      });
      return soundId;
    }

    if (id && !sound._paused) {
      if (!internal) {
        this._loadQueue("play");
      }
      return sound._id;
    }

    if (this._webAudio) {
      this._soundGlobal._autoResume();
    }

    const seek = Math.max(
      0,
      sound._seek > 0 ? sound._seek : this._sprite[sprite as string][0] / 1000
    );
    const duration = Math.max(
      0,
      (this._sprite[sprite as string][0] + this._sprite[sprite as string][1]) / 1000 - seek
    );
    const timeout = (duration * 1000) / Math.abs(sound._rate);
    const start = this._sprite[sprite as string][0] / 1000;
    const stop = (this._sprite[sprite as string][0] + this._sprite[sprite as string][1]) / 1000;
    sound._sprite = sprite as string;
    sound._ended = false;

    const setParams = () => {
      sound._paused = false;
      sound._seek = seek;
      sound._start = start;
      sound._stop = stop;
      sound._loop = !!(sound._loop || this._sprite[sprite as string][2]);
    };

    if (seek >= stop) {
      this._ended(sound);
      return null;
    }

    const node = sound._node;
    if (this._webAudio && node) {
      const playWebAudio = () => {
        this._playLock = false;
        setParams();
        this._refreshBuffer(sound);

        const vol = sound._muted || this._muted ? 0 : sound._volume;
        (node as GainNode).gain.setValueAtTime(vol, this._soundGlobal.ctx!.currentTime);
        sound._playStart = this._soundGlobal.ctx!.currentTime;

        if ((node as any).bufferSource.start) {
          sound._loop
            ? (node as any).bufferSource.start(0, seek, 86400)
            : (node as any).bufferSource.start(0, seek, duration);
        }

        if (timeout !== Infinity) {
          this._endTimers[sound._id] = window.setTimeout(
            () => this._ended(sound),
            timeout
          );
        }

        if (!internal) {
          setTimeout(() => {
            this._emit("play", sound._id);
            this._loadQueue();
          }, 0);
        }
      };

      if (this._soundGlobal.state === "running" && this._soundGlobal.ctx?.state !== "interrupted") {
        playWebAudio();
      } else {
        this._playLock = true;
        this.once("resume", playWebAudio);
        this._clearTimer(sound._id);
      }
    } else if (node) {
      const playHtml5 = () => {
        (node as HTMLAudioElement).currentTime = seek;
        (node as HTMLAudioElement).muted =
          sound._muted || this._muted || this._soundGlobal._muted || (node as HTMLAudioElement).muted;
        (node as HTMLAudioElement).volume = sound._volume * (this._soundGlobal.volume() as number);
        (node as HTMLAudioElement).playbackRate = sound._rate;

        try {
          const playPromise = (node as HTMLAudioElement).play();
          if (playPromise) {
            this._playLock = true;
            setParams();
            playPromise
              .then(() => {
                this._playLock = false;
                (node as any)._unlocked = true;
                if (!internal) {
                  this._emit("play", sound._id);
                }
                this._loadQueue();
              })
              .catch(() => {
                this._playLock = false;
                this._emit(
                  "playerror",
                  sound._id,
                  "Playback was unable to start."
                );
                sound._ended = true;
                sound._paused = true;
              });
          }
        } catch (err) {
          this._emit("playerror", sound._id, err);
        }
      };

      if ((node as HTMLAudioElement).src === 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA') {
          (node as HTMLAudioElement).src = this._src as string;
          (node as HTMLAudioElement).load();
      }

      if ((node as HTMLAudioElement).readyState >= 3 || (!node.readyState && (this._soundGlobal._navigator as any).isCocoonJS)) {
        playHtml5();
      } else {
        this._playLock = true;
        this._state = 'loading';
        const listener = () => {
            this._state = 'loaded';
            playHtml5();
            node.removeEventListener(this._soundGlobal._canPlayEvent, listener, false);
        };
        node.addEventListener(this._soundGlobal._canPlayEvent, listener, false);
        this._clearTimer(sound._id);
      }
    }

    return sound._id;
  }

  pause(id?: number, internal?: boolean): this {
    if (this._state !== "loaded" || this._playLock) {
      this._queue.push({
        event: "pause",
        action: () => {
          this.pause(id);
        },
      });
      return this;
    }

    const ids = this._getSoundIds(id);
    for (const soundId of ids) {
      this._clearTimer(soundId);
      const sound = this._soundById(soundId);
      if (sound && !sound._paused) {
        sound._seek = this.seek(soundId) as number;
        sound._rateSeek = 0;
        sound._paused = true;
        this._stopFade(soundId);

        if (sound._node) {
          if (this._webAudio) {
            if (!(sound._node as any).bufferSource) {
              continue;
            }
            if ((sound._node as any).bufferSource.stop) {
              (sound._node as any).bufferSource.stop(0);
            }
            this._cleanBuffer(sound._node as GainNode);
          } else if (!isNaN((sound._node as HTMLAudioElement).duration)) {
            (sound._node as HTMLAudioElement).pause();
          }
        }
      }
      if (!internal) {
        this._emit("pause", sound ? sound._id : null);
      }
    }
    return this;
  }

  stop(id?: number, internal?: boolean): this {
    if (this._state !== "loaded" || this._playLock) {
      this._queue.push({
        event: "stop",
        action: () => {
          this.stop(id, internal);
        },
      });
      return this;
    }

    const ids = this._getSoundIds(id);
    for (const soundId of ids) {
      this._clearTimer(soundId);
      const sound = this._soundById(soundId);
      if (sound) {
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._paused = true;
        sound._ended = true;
        this._stopFade(soundId);

        if (sound._node) {
          if (this._webAudio) {
            if ((sound._node as any).bufferSource) {
              if ((sound._node as any).bufferSource.stop) {
                (sound._node as any).bufferSource.stop(0);
              }
              this._cleanBuffer(sound._node as GainNode);
            }
          } else if (!isNaN((sound._node as HTMLAudioElement).duration)) {
            (sound._node as HTMLAudioElement).currentTime = sound._start || 0;
            (sound._node as HTMLAudioElement).pause();
            if ((sound._node as HTMLAudioElement).duration === Infinity) {
                this._clearSound(sound._node as HTMLAudioElement);
            }
          }
        }
        if (!internal) {
          this._emit("stop", sound._id);
        }
      }
    }
    return this;
  }

  mute(muted: boolean, id?: number, internal?: boolean): this {
    if (this._state !== "loaded" || this._playLock) {
      this._queue.push({
        event: "mute",
        action: () => {
          this.mute(muted, id);
        },
      });
      return this;
    }

    if (typeof id === "undefined") {
      this._muted = muted;
    }

    const ids = this._getSoundIds(id);
    for (const soundId of ids) {
      const sound = this._soundById(soundId);
      if (sound) {
        sound._muted = muted;
        if (sound._interval) {
          this._stopFade(sound._id);
        }

        if (this._webAudio && sound._node) {
          (sound._node as GainNode).gain.setValueAtTime(
            muted ? 0 : sound._volume,
            this._soundGlobal.ctx!.currentTime
          );
        } else if (sound._node) {
          (sound._node as HTMLAudioElement).muted = this._soundGlobal._muted
            ? true
            : muted;
        }

        if (!internal) {
          this._emit("mute", sound._id);
        }
      }
    }
    return this;
  }

  volume(): number;
  volume(id: number): number;
  volume(vol: number): this;
  volume(vol: number, id: number): this;
  volume(volOrId?: number, id?: number): this | number {
      if (volOrId === undefined) {
          return this._volume;
      }

      if (id === undefined) {
          const sound = this._soundById(volOrId);
          if (sound) {
              return sound._volume;
          }
      }
      
      const vol = volOrId;

      if (this._state !== "loaded" || this._playLock) {
          this._queue.push({
              event: "volume",
              action: () => {
                  this.volume(vol, id);
              },
          });
          return this;
      }

      if (id === undefined) {
          this._volume = vol;
      }

      const ids = this._getSoundIds(id);
      for (const soundId of ids) {
          const sound = this._soundById(soundId);
          if (sound) {
              sound._volume = vol;
              this._stopFade(sound._id);

              if (this._webAudio && sound._node && !sound._muted) {
                  (sound._node as GainNode).gain.setValueAtTime(
                      vol,
                      this._soundGlobal.ctx!.currentTime
                  );
              } else if (sound._node && !sound._muted) {
                  (sound._node as HTMLAudioElement).volume = vol * (this._soundGlobal.volume() as number);
              }
              this._emit("volume", sound._id);
          }
      }
      return this;
  }

  fade(from: number, to: number, len: number, id?: number): this {
    if (this._state !== "loaded" || this._playLock) {
      this._queue.push({
        event: "fade",
        action: () => {
          this.fade(from, to, len, id);
        },
      });
      return this;
    }

    from = Math.min(Math.max(0, from), 1);
    to = Math.min(Math.max(0, to), 1);

    this.volume(from, id);

    const ids = this._getSoundIds(id);
    for (const soundId of ids) {
      const sound = this._soundById(soundId);
      if (sound) {
        if (!id) {
          this._stopFade(soundId);
        }
        if (this._webAudio && !sound._muted && sound._node) {
          const currentTime = this._soundGlobal.ctx!.currentTime;
          const end = currentTime + len / 1000;
          sound._volume = from;
          (sound._node as GainNode).gain.setValueAtTime(from, currentTime);
          (sound._node as GainNode).gain.linearRampToValueAtTime(to, end);
        }
        this._startFadeInterval(sound, from, to, len, soundId, typeof id === 'undefined');
      }
    }
    return this;
  }

  loop(): boolean;
  loop(id: number): boolean;
  loop(loop: boolean): this;
  loop(loop: boolean, id: number): this;
  loop(loopOrId?: boolean | number, id?: number): this | boolean {
      if (loopOrId === undefined) {
          return this._loop;
      }

      if (typeof loopOrId === 'number') {
          const sound = this._soundById(loopOrId);
          return sound ? sound._loop : false;
      }
      
      const loop = loopOrId;

      if (id === undefined) {
          this._loop = loop;
      }

      const ids = this._getSoundIds(id);
      for (const soundId of ids) {
          const sound = this._soundById(soundId);
          if (sound) {
              sound._loop = loop;
              if (this._webAudio && sound._node && (sound._node as any).bufferSource) {
                  (sound._node as any).bufferSource.loop = loop;
                  if (loop) {
                      (sound._node as any).bufferSource.loopStart = sound._start || 0;
                      (sound._node as any).bufferSource.loopEnd = sound._stop || 0;
                      if (this.playing(soundId)) {
                          this.pause(soundId, true);
                          this.play(soundId, true);
                      }
                  }
              }
          }
      }
      return this;
  }

  rate(): number;
  rate(id: number): number;
  rate(rate: number): this;
  rate(rate: number, id: number): this;
  rate(rateOrId?: number, id?: number): this | number {
      if (rateOrId === undefined) {
          return this._sounds.length > 0 ? this._sounds[0]._rate : this._rate;
      }
      if (id === undefined) {
          const sound = this._soundById(rateOrId);
          if (sound) {
              return sound._rate;
          }
      }
      const rate = rateOrId;

      if (this._state !== "loaded" || this._playLock) {
          this._queue.push({
              event: "rate",
              action: () => {
                  this.rate(rate, id);
              },
          });
          return this;
      }

      if (id === undefined) {
          this._rate = rate;
      }

      const ids = this._getSoundIds(id);
      for (const soundId of ids) {
          const sound = this._soundById(soundId);
          if (sound) {
              if (this.playing(soundId)) {
                  sound._rateSeek = this.seek(soundId) as number;
                  sound._playStart = this._webAudio ? this._soundGlobal.ctx!.currentTime : sound._playStart;
              }
              sound._rate = rate;

              if (this._webAudio && sound._node && (sound._node as any).bufferSource) {
                  (sound._node as any).bufferSource.playbackRate.setValueAtTime(rate, this._soundGlobal.ctx!.currentTime);
              } else if (sound._node) {
                  (sound._node as HTMLAudioElement).playbackRate = rate;
              }

              const seek = this.seek(soundId) as number;
              const duration = ((this._sprite[sound._sprite][0] + this._sprite[sound._sprite][1]) / 1000) - seek;
              const timeout = (duration * 1000) / Math.abs(sound._rate);

              if (this._endTimers[soundId] || !sound._paused) {
                  this._clearTimer(soundId);
                  this._endTimers[soundId] = window.setTimeout(() => this._ended(sound), timeout);
              }
              this._emit('rate', sound._id);
          }
      }
      return this;
  }

  seek(): number;
  seek(id: number): number;
  seek(seek: number): this;
  seek(seek: number, id: number): this;
  seek(seekOrId?: number, id?: number): this | number {
      if (seekOrId === undefined) {
          return this._sounds.length > 0 ? this.seek(this._sounds[0]._id) : 0;
      }

      if (id === undefined && typeof seekOrId === 'number') {
          const sound = this._soundById(seekOrId);
          if (sound) {
            if (this._webAudio) {
                const realTime = this.playing(sound._id) ? this._soundGlobal.ctx!.currentTime - sound._playStart : 0;
                const rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
                return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
            } else {
                return (sound._node as HTMLAudioElement).currentTime;
            }
          }
      }

      const seek = seekOrId;
      const soundId = id || (this._sounds.length > 0 ? this._sounds[0]._id : undefined);

      if (soundId === undefined) {
        return this;
      }

      if (this._state !== "loaded" || this._playLock) {
          this._queue.push({
              event: 'seek',
              action: () => {
                  this.seek(seek, soundId);
              }
          });
          return this;
      }

      const sound = this._soundById(soundId);
      if (sound) {
          const playing = this.playing(sound._id);
          if (playing) {
              this.pause(sound._id, true);
          }
          sound._seek = seek;
          sound._ended = false;
          this._clearTimer(sound._id);

          if (!this._webAudio && sound._node && !isNaN((sound._node as HTMLAudioElement).duration)) {
              (sound._node as HTMLAudioElement).currentTime = seek;
          }

          const seekAndEmit = () => {
              if (playing) {
                  this.play(sound._id, true);
              }
              this._emit('seek', sound._id);
          };

          if (playing && !this._webAudio) {
              const emitSeek = () => {
                  if (!this._playLock) {
                      seekAndEmit();
                  } else {
                      setTimeout(emitSeek, 0);
                  }
              };
              setTimeout(emitSeek, 0);
          } else {
              seekAndEmit();
          }
      }
      return this;
  }

  playing(id?: number): boolean {
    if (typeof id === "number") {
      const sound = this._soundById(id);
      return sound ? !sound._paused : false;
    }
    for (const sound of this._sounds) {
      if (!sound._paused) {
        return true;
      }
    }
    return false;
  }

  duration(id?: number): number {
    let duration = this._duration;
    const sound = this._soundById(id);
    if (sound) {
      duration = this._sprite[sound._sprite][1] / 1000;
    }
    return duration;
  }

  state(): SoundState {
    return this._state;
  }

  unload(): null {
    const sounds = this._sounds;
    for (const sound of sounds) {
      if (!sound._paused) {
        this.stop(sound._id);
      }
      if (!this._webAudio) {
        this._clearSound(sound._node as HTMLAudioElement);
        sound._node?.removeEventListener("error", sound._errorFn, false);
        sound._node?.removeEventListener(
          this._soundGlobal._canPlayEvent,
          sound._loadFn,
          false
        );
        sound._node?.removeEventListener("ended", sound._endFn, false);
        this._soundGlobal._releaseHtml5Audio(sound._node as HTMLAudioElement);
      }
      delete (sound as any)._node;
      this._clearTimer(sound._id);
    }

    const index = this._soundGlobal._sounds.indexOf(this);
    if (index >= 0) {
      this._soundGlobal._sounds.splice(index, 1);
    }

    let remCache = true;
    for (const howl of this._soundGlobal._sounds) {
      if (howl._src === this._src) {
        remCache = false;
        break;
      }
    }
    if (cache && remCache) {
      delete cache[this._src as string];
    }

    this._state = "unloaded";
    this._sounds = [];
    return null;
  }

  on(event: string, fn: (...args: any[]) => void, id?: number): this {
    const events = this[`_on${event}` as keyof this] as EventListener[];
    events.push({ id, fn });
    return this;
  }

  off(event: string, fn?: (...args: any[]) => void, id?: number): this {
    const events = this[`_on${event}` as keyof this] as EventListener[];
    if (fn || id) {
      for (let i = events.length - 1; i >= 0; i--) {
        if (
          (fn && events[i].fn === fn && events[i].id === id) ||
          (!fn && events[i].id === id)
        ) {
          events.splice(i, 1);
        }
      }
    } else {
      (this as any)[`_on${event}`] = [];
    }
    return this;
  }

  once(event: string, fn: (...args: any[]) => void, id?: number): this {
    const events = this[`_on${event}` as keyof this] as EventListener[];
    events.push({ id, fn, once: true });
    return this;
  }

  _emit(event: string, id?: number | null, msg?: any): this {
    const events = this[`_on${event}` as keyof this] as EventListener[];
    for (let i = events.length - 1; i >= 0; i--) {
      if (!events[i].id || events[i].id === id || event === "load") {
        const eventToFire = events[i];
        setTimeout(() => {
          eventToFire.fn.call(this, id, msg);
        }, 0);
        if (eventToFire.once) {
          this.off(event, eventToFire.fn, eventToFire.id);
        }
      }
    }
    this._loadQueue(event);
    return this;
  }

  private _loadQueue(event?: string): this {
    if (this._queue.length > 0) {
      const task = this._queue[0];
      if (task.event === event) {
        this._queue.shift();
        this._loadQueue();
      }
      if (!event) {
        task.action();
      }
    }
    return this;
  }

  private _ended(sound: SoundInstance): this {
    const sprite = sound._sprite;
    const loop = !!(sound._loop || this._sprite[sprite][2]);

    this._emit("end", sound._id);

    if (!this._webAudio && loop) {
      this.stop(sound._id, true).play(sound._id);
    }

    if (this._webAudio && loop) {
      this._emit("play", sound._id);
      sound._seek = sound._start || 0;
      sound._rateSeek = 0;
      sound._playStart = this._soundGlobal.ctx!.currentTime;
      const timeout =
        ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
      this._endTimers[sound._id] = window.setTimeout(() => this._ended(sound), timeout);
    }

    if (this._webAudio && !loop) {
      sound._paused = true;
      sound._ended = true;
      sound._seek = sound._start || 0;
      sound._rateSeek = 0;
      this._clearTimer(sound._id);
      this._cleanBuffer(sound._node as GainNode);
      this._soundGlobal["_autoSuspend"]();
    }

    if (!this._webAudio && !loop) {
      this.stop(sound._id, true);
    }

    return this;
  }

  private _clearTimer(id: number): this {
    if (this._endTimers[id]) {
      if (typeof this._endTimers[id] !== "function") {
        clearTimeout(this._endTimers[id] as number);
      } else {
        const sound = this._soundById(id);
        if (sound && sound._node) {
            sound._node.removeEventListener('ended', this._endTimers[id] as () => void, false);
        }
      }
      delete this._endTimers[id];
    }
    return this;
  }

  _soundById(id: number | null): SoundInstance | null {
    if (id === null) return null;
    for (const sound of this._sounds) {
      if (id === sound._id) {
        return sound;
      }
    }
    return null;
  }

  private _inactiveSound(): SoundInstance {
    this._drain();
    for (const sound of this._sounds) {
      if (sound._ended) {
        return sound.reset();
      }
    }
    return new SoundInstance(this);
  }

  private _drain(): void {
    const limit = this._pool;
    let cnt = 0;
    if (this._sounds.length < limit) {
      return;
    }
    for (const sound of this._sounds) {
      if (sound._ended) {
        cnt++;
      }
    }
    for (let i = this._sounds.length - 1; i >= 0; i--) {
      if (cnt <= limit) {
        return;
      }
      if (this._sounds[i]._ended) {
        if (this._webAudio && this._sounds[i]._node) {
          (this._sounds[i]._node as GainNode).disconnect(0);
        }
        this._sounds.splice(i, 1);
        cnt--;
      }
    }
  }

  _getSoundIds(id?: number): number[] {
    if (typeof id === "undefined") {
      return this._sounds.map((s) => s._id);
    } else {
      return [id];
    }
  }

  private _refreshBuffer(sound: SoundInstance): this {
    if (sound._node) {
      (sound._node as any).bufferSource = this._soundGlobal.ctx!.createBufferSource();
      (sound._node as any).bufferSource.buffer = cache[this._src as string];
      if (sound._panner) {
        (sound._node as any).bufferSource.connect(sound._panner);
      } else {
        (sound._node as any).bufferSource.connect(sound._node);
      }
      (sound._node as any).bufferSource.loop = sound._loop;
      if (sound._loop) {
        (sound._node as any).bufferSource.loopStart = sound._start || 0;
        (sound._node as any).bufferSource.loopEnd = sound._stop || 0;
      }
      (sound._node as any).bufferSource.playbackRate.setValueAtTime(
        sound._rate,
        this._soundGlobal.ctx!.currentTime
      );
    }
    return this;
  }

  private _cleanBuffer(node: GainNode): this {
    const isIOS =
      this._soundGlobal._navigator &&
      this._soundGlobal._navigator.vendor.indexOf("Apple") >= 0;
    if ((node as any).bufferSource) {
      (node as any).bufferSource.onended = null;
      (node as any).bufferSource.disconnect(0);
      if (isIOS) {
        try {
          (node as any).bufferSource.buffer = this._soundGlobal["_scratchBuffer"];
        } catch (e) {}
      }
    }
    (node as any).bufferSource = null;
    return this;
  }

  private _clearSound(node: HTMLAudioElement): void {
      const checkIE = /MSIE |Trident\//.test(this._soundGlobal._navigator?.userAgent ?? "");
      if (!checkIE) {
          node.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      }
  }

  private _startFadeInterval(sound: SoundInstance, from: number, to: number, len: number, id: number, isGroup: boolean) {
      let vol = from;
      const diff = to - from;
      const steps = Math.abs(diff / 0.01);
      const stepLen = Math.max(4, (steps > 0) ? len / steps : len);
      let lastTick = Date.now();

      sound._fadeTo = to;

      sound._interval = window.setInterval(() => {
          const tick = (Date.now() - lastTick) / len;
          lastTick = Date.now();
          vol += diff * tick;
          vol = Math.round(vol * 100) / 100;

          if (diff < 0) {
              vol = Math.max(to, vol);
          } else {
              vol = Math.min(to, vol);
          }

          if (this._webAudio) {
              sound._volume = vol;
          } else {
              this.volume(vol, sound._id);
          }

          if (isGroup) {
              this._volume = vol;
          }

          if ((to < from && vol <= to) || (to > from && vol >= to)) {
              clearInterval(sound._interval as number);
              sound._interval = null;
              sound._fadeTo = null;
              this.volume(to, sound._id);
              this._emit('fade', sound._id);
          }
      }, stepLen);
  }

  _stopFade(id: number): this {
      const sound = this._soundById(id);
      if (sound && sound._interval) {
          if (this._webAudio && sound._node) {
              (sound._node as GainNode).gain.cancelScheduledValues(this._soundGlobal.ctx!.currentTime);
          }
          clearInterval(sound._interval as number);
          sound._interval = null;
          this.volume(sound._fadeTo!, id);
          sound._fadeTo = null;
          this._emit('fade', id);
      }
      return this;
  }

  private loadBuffer(): void {
    const url = this._src as string;
    if (cache[url]) {
      this._duration = cache[url].duration;
      this.loadSound(cache[url]);
      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      const data = atob(url.split(",")[1]);
      const dataView = new Uint8Array(data.length);
      for (let i = 0; i < data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }
      this.decodeAudioData(dataView.buffer);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open(this._xhr?.method || "GET", url, true);
      xhr.withCredentials = this._xhr?.withCredentials || false;
      xhr.responseType = "arraybuffer";

      if (this._xhr?.headers) {
        Object.keys(this._xhr.headers).forEach((key) => {
          xhr.setRequestHeader(key, this._xhr!.headers![key]);
        });
      }

      xhr.onload = () => {
        const code = (xhr.status + "")[0];
        if (code !== "0" && code !== "2" && code !== "3") {
          this._emit(
            "loaderror",
            null,
            `Failed loading audio file with status: ${xhr.status}.`
          );
          return;
        }
        this.decodeAudioData(xhr.response);
      };

      xhr.onerror = () => {
        if (this._webAudio) {
          this._html5 = true;
          this._webAudio = false;
          this._sounds = [];
          delete cache[url];
          this.load();
        }
      };

      try {
        xhr.send();
      } catch (e) {
        xhr.onerror();
      }
    }
  }

  private decodeAudioData(arraybuffer: ArrayBuffer): void {
    const error = () => {
      this._emit("loaderror", null, "Decoding audio data failed.");
    };
    const success = (buffer: AudioBuffer) => {
      if (buffer && this._sounds.length > 0) {
        cache[this._src as string] = buffer;
        this.loadSound(buffer);
      } else {
        error();
      }
    };

    if (this._soundGlobal.ctx!.decodeAudioData.length === 1) {
      this._soundGlobal.ctx!.decodeAudioData(arraybuffer).then(success).catch(error);
    } else {
      this._soundGlobal.ctx!.decodeAudioData(arraybuffer, success, error);
    }
  }

  private loadSound(buffer: AudioBuffer): void {
    if (buffer && !this._duration) {
      this._duration = buffer.duration;
    }
    if (Object.keys(this._sprite).length === 0) {
      this._sprite = { __default: [0, this._duration * 1000] };
    }
    if (this._state !== "loaded") {
      this._state = "loaded";
      this._emit("load");
      this._loadQueue();
    }
  }

  _unlockNodes() {
      for (const sound of this._sounds) {
          if (sound._node && !(sound._node as any)._unlocked) {
              (sound._node as any)._unlocked = true;
              (sound._node as HTMLAudioElement).load();
          }
      }
  }
}

class SoundInstance {
  _parent: Sound;
  _muted: boolean;
  _loop: boolean;
  _volume: number;
  _rate: number;
  _seek = 0;
  _paused = true;
  _ended = true;
  _sprite = "__default";
  _id: number;
  _node: GainNode | HTMLAudioElement | null = null;
  _panner: PannerNode | null = null;
  _errorFn: () => void;
  _loadFn: () => void;
  _endFn: () => void;
  _playStart = 0;
  _rateSeek = 0;
  _start = 0;
  _stop = 0;
  _fadeTo: number | null = null;
  _interval: number | null = null;

  constructor(parent: Sound) {
    this._parent = parent;
    this._muted = parent["_muted"];
    this._loop = parent["_loop"];
    this._volume = parent["_volume"];
    this._rate = parent["_rate"];
    this._id = ++SoundGlobal.getInstance()._counter;
    this._errorFn = this._errorListener.bind(this);
    this._loadFn = this._loadListener.bind(this);
    this._endFn = this._endListener.bind(this);
    parent["_sounds"].push(this);
    this.create();
  }

  create(): this {
    const parent = this._parent;
    const soundGlobal = SoundGlobal.getInstance();
    const volume =
      soundGlobal._muted || this._muted || parent["_muted"] ? 0 : this._volume;

    if (parent._webAudio) {
      this._node = soundGlobal.ctx!.createGain();
      (this._node as GainNode).gain.setValueAtTime(
        volume,
        soundGlobal.ctx!.currentTime
      );
      (this._node as GainNode).connect(soundGlobal.masterGain!);
    } else if (!soundGlobal.noAudio) {
      this._node = soundGlobal._obtainHtml5Audio();
      this._node.addEventListener("error", this._errorFn, false);
      this._node.addEventListener(soundGlobal._canPlayEvent, this._loadFn, false);
      this._node.addEventListener("ended", this._endFn, false);
      this._node.src = parent._src as string;
      this._node.preload = parent["_preload"] === true ? "auto" : (parent["_preload"] as "metadata");
      this._node.volume = volume * (soundGlobal.volume() as number);
      this._node.load();
    }
    return this;
  }

  reset(): this {
    const parent = this._parent;
    this._muted = parent["_muted"];
    this._loop = parent["_loop"];
    this._volume = parent["_volume"];
    this._rate = parent["_rate"];
    this._seek = 0;
    this._rateSeek = 0;
    this._paused = true;
    this._ended = true;
    this._sprite = "__default";
    this._id = ++SoundGlobal.getInstance()._counter;
    return this;
  }

  private _errorListener(): void {
    this._parent._emit(
      "loaderror",
      this._id,
      (this._node as HTMLAudioElement).error
        ? (this._node as HTMLAudioElement).error!.code
        : 0
    );
    this._node?.removeEventListener("error", this._errorFn, false);
  }

  private _loadListener(): void {
    const parent = this._parent;
    parent["_duration"] = Math.ceil((this._node as HTMLAudioElement).duration * 10) / 10;

    if (Object.keys(parent._sprite).length === 0) {
      parent._sprite = { __default: [0, parent["_duration"] * 1000] };
    }

    if (parent._state !== "loaded") {
      parent._state = "loaded";
      parent._emit("load");
      parent["_loadQueue"]();
    }
    this._node?.removeEventListener(
      SoundGlobal.getInstance()._canPlayEvent,
      this._loadFn,
      false
    );
  }

  private _endListener(): void {
      const parent = this._parent;
      if (parent["_duration"] === Infinity) {
          parent["_duration"] = Math.ceil((this._node as HTMLAudioElement).duration * 10) / 10;
          if (parent._sprite.__default[1] === Infinity) {
              parent._sprite.__default[1] = parent["_duration"] * 1000;
          }
          parent["_ended"](this);
      }
      this._node?.removeEventListener('ended', this._endFn, false);
  }
}

const useSound = (options: SoundOptions) => {
  const soundRef = useRef<Sound | null>(null);

  useEffect(() => {
    soundRef.current = new Sound(options);
    const sound = soundRef.current;

    return () => {
      if (sound) {
        sound.unload();
      }
    };
  }, []); 

  const controls = {
    play: useCallback((sprite?: string | number) => soundRef.current?.play(sprite), []),
    pause: useCallback((id?: number) => soundRef.current?.pause(id), []),
    stop: useCallback((id?: number) => soundRef.current?.stop(id), []),
    mute: useCallback((muted: boolean, id?: number) => soundRef.current?.mute(muted, id), []),
    volume: useCallback((...args: any[]) => (soundRef.current?.volume as any)(...args), []),
    fade: useCallback((from: number, to: number, len: number, id?: number) => soundRef.current?.fade(from, to, len, id), []),
    loop: useCallback((...args: any[]) => (soundRef.current?.loop as any)(...args), []),
    rate: useCallback((...args: any[]) => (soundRef.current?.rate as any)(...args), []),
    seek: useCallback((...args: any[]) => (soundRef.current?.seek as any)(...args), []),
    playing: useCallback((id?: number) => soundRef.current?.playing(id) ?? false, []),
    duration: useCallback((id?: number) => soundRef.current?.duration(id) ?? 0, []),
    state: useCallback(() => soundRef.current?.state() ?? 'unloaded', []),
    on: useCallback((event: string, fn: (...args: any[]) => void, id?: number) => soundRef.current?.on(event, fn, id), []),
    off: useCallback((event: string, fn?: (...args: any[]) => void, id?: number) => soundRef.current?.off(event, fn, id), []),
    once: useCallback((event: string, fn: (...args: any[]) => void, id?: number) => soundRef.current?.once(event, fn, id), []),
  };

  return controls;
};
