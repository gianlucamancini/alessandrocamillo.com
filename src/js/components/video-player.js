import 'browsernizr/test/touchevents';

import Modernizr from 'browsernizr';
import Player from '@vimeo/player';

class VideoPlayer {
  constructor(element) {
    if (!element) {
      return;
    }

    this.element = element;

    this.initComponent();
    this.registerEventListeners();
  }

  initComponent() {
    const id = Number(this.element.getAttribute('data-id'));
    const options = {};

    options.id = id;

    if (Modernizr.touchevents) {
      options.playsinline = true;
    } else {
      options.autoplay = true;
      options.background = true;
    }

    this.player = new Player(element, options);
    // this.seekBar = null;
  }

  registerEventListeners() {
    this.onTimeUpdate = (event) => {
      this.player.getCurrentTime().then((time) => {
        this.seekBar.value = time * 10;
      });
    }

    this.player.on('play', () => {
      this.player.getDuration().then((duration) => {
        this.seekBar.max = duration * 10;
      });

      this.seekBar.addEventListener('change', () => {
        this.player.setCurrentTime(this.seekBar.value / 10);
        this.player.on('timeupdate', this.onTimeUpdate);
      });

      this.seekBar.addEventListener('input', () => {
        this.player.off('timeupdate', this.onTimeUpdate);
      });

      this.player.on('timeupdate', this.onTimeUpdate);
    });

    this.player.on('pause', () => {
      this.player.off('timeupdate', this.onTimeUpdate);
    });

    this.player.on('ended', () => {
      this.ended();
    });

    this.player.on('loaded', () => {
      this.loaded();
    });
  }

  play() {
    this.player.play().catch((error) => {
      switch (error.name) {
        case 'AbortError':
          this.onError();
      }
    });

    this.player.setVolume(1);
    this.player.setLoop(false);
  }

  reset() {
    this.player.off('play');
    this.player.off('pause');
    this.player.off('timeupdate', this.onTimeUpdate);
  }

  loaded(cb) {
    // event.target.classList.add('is-loaded');
    cb();
  }

  ended() {
    // event.target.classList.add('is-paused');
    // event.target.classList.remove('is-playing');
  }

  onError(cb) {
    cb();
    // event.target.classList.remove('is-playing');
    // event.target.classList.add('is-paused');
  }
}
