function whiten(channel, weight) {
  const whitener = channel > 230 ? 220 : 255;

  return ((channel * (1 - weight)) + (whitener * weight));
}

function getLightenedColor(element) {
  let [r, g, b] = getComputedStyle(element)
    .backgroundColor
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/\s+/, '')
    .split(',');

  r = Math.floor(whiten(r, .75));
  g = Math.floor(whiten(g, .75));
  b = Math.floor(whiten(b, .75));

  return [r, g, b];
}

function getRippleAnimation(element) {
  const [r, g, b] = getLightenedColor(element);

  return `
    @keyframes ripple {
      0% {
        height: 0;
        width: 0;
        background-color: rgba(${r}, ${g}, ${b}, 0.75);
      }
      80% {
        height: 500px;
        width: 500px;
        opacity: 1; 
      }
      100% {
        opacity: 0;
        background-color: rgba(${r}, ${g}, ${b}, 0);
      }
    }
  `;
}

(() => {

  'use strict';

  const RippleButton = Object.create(HTMLButtonElement.prototype);

  RippleButton.createdCallback = function () {

    const duration = 1000;
    const root = this.createShadowRoot();
    const styles = document.createElement('style');
    const animation = document.createElement('style');
    const content = document.createElement('content');

    styles.innerHTML = `
      ${getRippleAnimation(this)}
      :host {
        background: initial;
        border: initial;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        line-height: 48px;
        min-height: 48px;
        overflow: hidden;
        padding: 0 10px;
        position: relative;
        outline: none;
        text-align: center;
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
      }
      :host(:hover) {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
      }
      :host(:active) {
        box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
      }
      .ripple {
        animation-duration: ${duration}ms;
        animation-iteration-count: 1;
        animation-name: ripple;
        animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
        background-color: gray;
        border-radius: 500px;
        height: 0;
        pointer-events: none;
        position: absolute;
        transform: translate(-50%, -50%);
        width: 0;
        z-index: 1;
      }
      content {
        line-height: normal;
        position-relative;
        vertical-align: middle;
        z-index: 2;
      }
    `;

    this.addEventListener('mouseup', event => {
      const ripple = document.createElement('div');

      ripple.classList.add('ripple');
      ripple.style.top = `${event.offsetY}px`;
      ripple.style.left = `${event.offsetX}px`;

      root.insertBefore(ripple, content);

      setTimeout(() => ripple.remove(), duration + 50);
    });

    root.appendChild(content);
    root.appendChild(animation);
    root.appendChild(styles);

  };

  document.registerElement('ripple-button', {
    prototype: RippleButton,
    extends: 'button'
  });

})();
