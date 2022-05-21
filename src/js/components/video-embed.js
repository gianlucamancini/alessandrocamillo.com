import 'browsernizr/test/touchevents';

import Player from '@vimeo/player';
import Modernizr from 'browsernizr';

export default class VideoEmbed {
  constructor(element, options = {}) {
    if (!element) { return }

    this.element = element;
    this.options = options;

    this.options.id = Number(this.element.getAttribute('data-id'));

    if (!Modernizr.touchevents) {
      this.options.background = true;
    }

    this.player = new Player(this.element, this.options);
  }

  static initialize() {
    const elements = [...document.querySelectorAll('.js-videoEmbed')];

    elements.forEach((element) => {
      const videoEmbed = new VideoEmbed(element, {
        muted: true
      });
    })
  }
}
