/**
 * @file Functions to allow touch and mouse handling.
 *
 * @module utils/dom/pointerActions
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Custom event names
 */
export const CUSTOM_POINTER_DOWN_EVENT_NAME = 'custom-pointer-down-event';
export const CUSTOM_POINTER_UP_EVENT_NAME = 'custom-pointer-up-event';
export const CUSTOM_CLICK_EVENT_NAME = 'custom-click-event';

/**
 * @typedef {Object} CustomEventDetail
 * @property {number} x
 * @property {number} y
 * @property {number} dx
 * @property {number} dy
 */

/**
 * Dispatch an event. Detail is dispatched in the event detail.
 * @param {Element} element
 * @param {string} eventName
 * @param {Object} detail
 */
function dispatchEvent(element, eventName, detail) {
  const event = new CustomEvent(eventName, {
    detail: detail,
  });
  element.dispatchEvent(event);
}

/**
 * Gets offsetX and offsetY equivalent to a MouseEvent
 * @param {TouchEvent} event
 * @returns {Object}
 */
function getOffsetFromTouch(event) {
  const rect = event.target.getBoundingClientRect();
  return {
    x: event.touches[0].pageX - rect.left,
    y: event.touches[0].pageY - rect.top,
  };
}

/**
 * Add custom listeners which allows an object to listen to touch and mouse events
 * in a consistent manner.
 * the element or clicks. Custom events are sent to differentiate.
 * @param {*} element
 */
export function addPointerListeners(element) {
  element.addEventListener(
    'mousedown',
    (event) =>
      dispatchEvent(element, CUSTOM_POINTER_DOWN_EVENT_NAME, {
        x: event.offsetX,
        y: event.offsetY,
      }),
    { passive: true }
  );

  element.addEventListener(
    'mouseup',
    (event) =>
      dispatchEvent(element, CUSTOM_POINTER_UP_EVENT_NAME, {
        x: event.offsetX,
        y: event.offsetY,
      }),
    { passive: true }
  );
  element.addEventListener(
    'touchstart',
    (event) => {
      if (event.changedTouches.length === 1) {
        const offset = getOffsetFromTouch(event);
        dispatchEvent(element, CUSTOM_POINTER_DOWN_EVENT_NAME, {
          x: offset.x,
          y: offset.y,
        });
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchend',
    (event) => {
      if (event.changedTouches.length === 1) {
        dispatchEvent(element, CUSTOM_POINTER_UP_EVENT_NAME, null);
      }
    },
    { passive: true }
  );
  element.addEventListener('click', (event) => {
    dispatchEvent(element, CUSTOM_CLICK_EVENT_NAME, {
      x: event.offsetX,
      y: event.offsetY,
    });
  });
}
