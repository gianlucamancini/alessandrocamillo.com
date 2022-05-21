import 'browsernizr/test/touchevents';

import Player from '@vimeo/player';
import SmoothScroll from 'smooth-scroll';
import Modernizr from 'browsernizr';

import Gallery from 'components/gallery';

const scroll = new SmoothScroll();

class ModuleList {
  constructor() {
    this.elements = [...document.querySelectorAll('.js-module')];

    if (!this.elements.length) {
      return;
    }

    this.initComponent();
    this.registerEventListeners();
  }

  initComponent() {
    this.pauseButtons = [...document.querySelectorAll('.js-modulePauseButton')];
    this.playButtons = [...document.querySelectorAll('.js-modulePlayButton')];

    this.linkCovers = [...document.querySelectorAll('.js-moduleLinkCover')];
    this.closeButtons = [...document.querySelectorAll('.js-moduleCloseButton')];
    this.adjustButtons = [...document.querySelectorAll('.js-moduleAdjustButton')];

    this.videos = [];
    this.carousels = [];

    this.extraModules = [];

    [...document.querySelectorAll('.js-extraModule')].forEach((extraModule) => {
      this.extraModules.push({
        count: Number(extraModule.getAttribute('data-count')),
        element: extraModule
      });
    });
  }

  registerEventListeners() {
    this.opened = (event) => {
      if (event.target.classList.contains('Module')) {

        this.pauseAllPlayers();
        this.restartAllPlayers();

        if (event.target.classList.contains('is-playing')) {
          event.target.classList.add('is-opened');

          const embed = event.target.querySelector('.Module-videoEmbed');
          const seekBar = event.target.querySelector('.js-seekBar');
          const id = Number(embed.getAttribute('data-id'));
          const options = {
            id: id
          };

          if (Modernizr.touchevents) {
            options.playsinline = true;
          } else {
            options.autoplay = true;
            options.background = true;
          }

          let video = this.videos.find(video => video.id === id);
          let player;

          if (video) {
            player = video.player;
          } else {
            player = new Player(embed, options);

            this.videos.push({
              id: id,
              player: player
            });
          }

          const onTimeUpdate = (e) => {
            player.getCurrentTime().then((time) => {
              seekBar.value = time * 10;
            });
          }

          this.videos.forEach((video) => {
            video.player.off('play');
            video.player.off('pause');
            video.player.off('timeupdate', onTimeUpdate);
          });

          player.on('play', () => {
            player.getDuration().then((duration) => {
              seekBar.max = duration * 10;
            });

            seekBar.addEventListener('change', () => {
              player.setCurrentTime(seekBar.value / 10);
              player.on('timeupdate', onTimeUpdate);
            });
            seekBar.addEventListener('input', () => {
              player.off('timeupdate', onTimeUpdate);
            });

            player.on('timeupdate', onTimeUpdate);
          });

          player.on('pause', () => {
            player.off('timeupdate', onTimeUpdate);
          });

          player.on('ended', () => {
            event.target.classList.add('is-paused');
            event.target.classList.remove('is-playing');
          });

          player.on('loaded', () => {
            event.target.classList.add('is-loaded');
          });

          player.play().catch((error) => {
            switch (error.name) {
              case 'AbortError':
                event.target.classList.remove('is-playing');
                event.target.classList.add('is-paused');
            }
          });
          player.setVolume(1);
          player.setLoop(false);
        } else if (event.target.classList.contains('Module--carousel')) {
          if (event.target.classList.contains('is-open')) {
            event.target.classList.add('is-opened');

            const gallery = event.target.querySelector('.Module-carousel');
            const id = gallery.getAttribute('data-id');

            let carousel = this.carousels.find(c => c.id === id);

            if (carousel) {
              carousel.gallery.focus();
            } else {
              let c = {
                id: id,
                gallery: new Gallery(gallery)
              }

              this.carousels.push(c);
              c.gallery.focus();
            }

            
          }
        }

        this.elements.forEach((element) => {
          element.removeEventListener('transitionend', this.onTransitionEnd);
        });
      }
    }
    this.onTransitionEnd = this.opened.bind(this);

    this.linkCovers.forEach((linkCover) => {
      linkCover.addEventListener('click', (event) => {
        const m = linkCover.parentNode;

        if (m.getAttribute('data-count')) {
          this.scrollTo(m);
        }

        this.closeAllModules();
        this.blurAllModules();

        m.classList.remove('is-blurred', 'is-closed', 'is-closing');

        if (m.classList.contains('Module--video')) {
          this.addPlayingClass(m);
        }

        this.elements.forEach((element) => {
          element.classList.remove('is-open', 'is-opened');
        });

        m.classList.add('is-open');

        m.addEventListener('transitionend', this.onTransitionEnd);
      });
    });

    this.elements.forEach((element) => {
      element.addEventListener('transitionend', (event) => {
        event.stopPropagation();

        element.classList.contains('is-open') || element.classList.remove('is-closing');
      });
    });

    this.pauseButtons.forEach((pauseButton) => {
      pauseButton.addEventListener('click', (event) => {
        const id = Number(pauseButton.getAttribute('data-id'));
        const video = this.videos.find(video => video.id === id);
        const m = pauseButton.parentNode.parentNode;

        video.player.pause();

        m.classList.remove('is-playing');
        m.classList.add('is-paused');
      });
    });

    this.playButtons.forEach((playButton) => {
      playButton.addEventListener('click', (event) => {
        const id = Number(playButton.getAttribute('data-id'));
        const video = this.videos.find(video => video.id === id);
        const m = playButton.parentNode.parentNode;

        video.player.play();

        m.classList.remove('is-paused');
        m.classList.add('is-playing');
      });
    });

    this.adjustButtons.forEach((adjustButton) => {
      adjustButton.addEventListener('click', (event) => {
        const m = adjustButton.parentNode.parentNode;

        m.classList.toggle('is-fullscreen');

        window.scrollTo({
          top: m.offsetTop,
          behavior: 'smooth'
        })
      });
    });

    this.closeButtons.forEach((closeButton) => {
      closeButton.addEventListener('click', (event) => {
        this.pauseAllPlayers();
        this.restartAllPlayers();

        this.closeAllModules();
        this.unblurAllModules();

        this.elements.forEach((element) => {
          element.classList.remove('is-open', 'is-opened');
        });
      });
    });

    const onFullscreenChange = (event) => {
      if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
        document.body.classList.add('is-fullscreen');
      } else {
        setTimeout(() => {
          document.body.classList.remove('is-fullscreen');
        }, 200);
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange, false);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
    document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
  }

  pauseAllPlayers() {
    this.videos.forEach((video) => {
      video.player.pause();
    });
  }

  restartAllPlayers() {
    this.videos.forEach((video) => {
      video.player.setCurrentTime(0);
    });

    this.carousels.forEach((carousel) => {
      carousel.gallery.goTo(0);
    });
  }

  closeAllModules() {
    this.elements.forEach((element) => {
      element.classList.remove('is-playing', 'is-paused', 'is-fullscreen');
      element.classList.add('is-closed', 'is-closing');
    });
  }

  blurAllModules() {
    this.elements.forEach((element) => {
      element.classList.add('is-blurred');
    });
  }

  unblurAllModules() {
    this.elements.forEach((element) => {
      element.classList.remove('is-blurred');
    });
  }

  addPlayingClass(element) {
    element.classList.remove('is-paused');
    element.classList.add('is-playing');
  }

  scrollTo(element) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if (vw >= 992) {

      let offset = parseInt(window.getComputedStyle(document.body).paddingTop);

      const closed = 24;
      const open = 56.1;

      const closedHeight = vw * closed / 100;
      const openHeight = vw * open / 100;
      const count = element.getAttribute('data-count');

      offset += (count - 1) * closedHeight;

      const extraOffset = this.extraModules.filter(elm => elm.count < count);

      if (extraOffset.length) {
        let openedModulesHeight = 0;
        const closedHeightOffset = closedHeight * extraOffset.length;

        extraOffset.forEach((a) => {openedModulesHeight += parseInt(a.element.clientHeight)});

        offset += openedModulesHeight - closedHeightOffset;
      }

      let position = offset - vh / 2 + closedHeight / 2;

      position += (openHeight - closedHeight) / 2;

      if (position > 0) {
        scroll.animateScroll(position, element, {
          speed: 1400,
          speedAsDuration: true
        });
      }
    }

  }
}

export default ModuleList;
