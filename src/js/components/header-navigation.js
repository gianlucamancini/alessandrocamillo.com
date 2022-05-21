import MoveTo from 'moveto';

export default class HeaderNavigation {
  static initialize() {
    const triggers = [...document.querySelectorAll('.js-moveTo')];
    const moveTo = new MoveTo({
      tolerance: 30
    });

    triggers.forEach((trigger) => {
      moveTo.registerTrigger(trigger);
    });
  }
}
