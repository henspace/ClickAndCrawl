/**
 * @file Functions to allow drag and click within an element.
 *
 * @module utils/dom/dragAndClick
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
const MIN_DRAG_MOVEMENT = 10;

/**
 * Custom event name
 */
export const CUSTOM_DRAG_EVENT_NAME = 'custom-drag-event';
export const CUSTOM_END_DRAG_EVENT_NAME = 'custom-end-drag-event';
export const CUSTOM_CLICK_EVENT_NAME = 'custom-click-event';

/**
 * @typedef {Object} CustomEventDetail
 * @property {number} x
 * @property {number} y
 * @property {number} dx
 * @property {number} dy
 */
/**
 * @typedef {Object} DragData
 * @property {boolean} actionStarted
 * @property {boolean} dragging
 * @property {number} lastX
 * @property {number} lastY
 * @property {number} startX
 * @property {number} startY
 * @property {number} x
 * @property {number} y
 */

/**
 * Process the start of the action.
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 */
function processStartAction(x, y, data) {
  data.actionStarted = true;
  data.dragging = false;
  data.distance = 0;
  data.lastX = x;
  data.lastY = y;
  data.startX = x;
  data.startY = y;
}

/**
 * Process the start of the action.
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 * @param {string} eventName
 * @return {CustomEvent} null if no event should be dispatched.
 */
function processMoveAction(x, y, data, eventName) {
  let dx = x - data.lastX;
  let dy = y - data.lastY;
  data.lastX = x;
  data.lastY = y;
  if (data.dragging) {
    const event = new CustomEvent(eventName, {
      detail: {
        x: x,
        y: y,
        dx: dx,
        dy: dy,
      },
    });
    data.element.dispatchEvent(event);
  } else if (
    Math.abs(x - data.startX) > MIN_DRAG_MOVEMENT ||
    Math.abs(y - data.startY) > MIN_DRAG_MOVEMENT
  ) {
    data.dragging = true;
  }
}

/**
 * Process the end of a touch event.
 * @param {DragData} data
 *
 */
function processTouchEndAction(data) {
  if (data.dragging) {
    const event = new CustomEvent(CUSTOM_END_DRAG_EVENT_NAME, {
      detail: null,
    });
    data.element.dispatchEvent(event);
  }
}

/**
 * Process the end of the action.
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 * */
function processClickAction(x, y, data) {
  let dx = x - data.lastX;
  let dy = y - data.lastY;
  if (!data.dragging) {
    const event = new CustomEvent(CUSTOM_CLICK_EVENT_NAME, {
      detail: {
        x: x,
        y: y,
        dx: dx,
        dy: dy,
      },
    });
    data.element.dispatchEvent(event);
  }
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
 * Add custom listeners which allows an object to listen to dragging actions on
 * the element or clicks. Custom events are sent to differentiate.
 * @param {*} element
 */
export function addDragAndClickListeners(element) {
  let dragData = {
    element: element,
    actionStarted: false,
    dragging: false,
    x: 0,
    y: 0,
  };
  element.addEventListener(
    'mousedown',
    (event) => processStartAction(event.offsetX, event.offsetY, dragData),
    { passive: true }
  );
  element.addEventListener(
    'mousemove',
    (event) => {
      if (event.buttons & 1) {
        processMoveAction(
          event.offsetX,
          event.offsetY,
          dragData,
          CUSTOM_DRAG_EVENT_NAME
        );
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'mouseup',
    (event) => {
      if (dragData.dragging) {
        processMoveAction(
          event.offsetX,
          event.offsetY,
          dragData,
          CUSTOM_END_DRAG_EVENT_NAME
        );
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchstart',
    (event) => {
      if (event.changedTouches.length === 1) {
        const offset = getOffsetFromTouch(event);
        processStartAction(offset.x, offset.y, dragData);
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchmove',
    (event) => {
      if (event.changedTouches.length === 1) {
        const offset = getOffsetFromTouch(event);
        processMoveAction(offset.x, offset.y, dragData, CUSTOM_DRAG_EVENT_NAME);
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchend',
    (event) => {
      if (event.changedTouches.length === 1) {
        processTouchEndAction(dragData);
      }
    },
    { passive: true }
  );
  element.addEventListener('click', (event) => {
    processClickAction(event.offsetX, event.offsetY, dragData);
  });
}
