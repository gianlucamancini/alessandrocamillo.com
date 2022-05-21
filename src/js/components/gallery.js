import Flickity from 'flickity';
import 'flickity-as-nav-for';

export default class Gallery {
  constructor(element) {
    if (!element) { return }

    this.element = element;

    this.carousel = new Flickity(this.element, {
      draggable: true,
      pageDots: false,
      prevNextButtons: true,
      lazyLoad: 3,
      percentPosition: true
    });

    this.enableDots();

    this.carousel.on('dragStart', () => (document.ontouchmove = event => event.preventDefault()));
    this.carousel.on('dragEnd', () => (document.ontouchmove = () => true));
  }

  focus() { this.carousel.focus(); }

  goTo(n) { return this.carousel.select(n); }

  enableDots() {
    const dots = this.element.parentNode.querySelector('.js-gallery-dots');

    if (!dots) { return }

    this.dots = new Flickity(dots, {
      asNavFor: this.element,
      contain: true,
      draggable: false,
      pageDots: false,
      prevNextButtons: false
    });
  }

  static initialize() {
    const elements = [...document.querySelectorAll('.js-gallery')];

    elements.forEach((element) => {
      const gallery = new Gallery(element);
    })
  }
}
