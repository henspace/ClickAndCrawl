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
import LOG from '../logging.js';
import { Point } from '../geometry.js';

/**
 * Custom event names
 */
export const CUSTOM_POINTER_DOWN_EVENT_NAME = 'custom-pointer-down-event';
export const CUSTOM_POINTER_UP_EVENT_NAME = 'custom-pointer-up-event';
export const CUSTOM_POINTER_CANCEL_EVENT_NAME = 'custom-pointer-cancel-event';
export const CUSTOM_CLICK_EVENT_NAME = 'custom-click-event';
export const CUSTOM_POINTER_DRAG_EVENT_NAME = 'custom-pointer-drag-event';
export const CUSTOM_POINTER_DRAG_END_EVENT_NAME =
  'custom-pointer-drag-end-event';

/** Minimum movement that constitutes a drag. */
const MIN_DRAG_MOVEMENT = 10;

/** @enum {number} */
const EventSource = {
  MOUSE: 0,
  TOUCH: 1,
};

/**
 * @typedef {Object} CustomEventDetail
 * @property {number} x
 * @property {number} y
 * @property {number} dx
 * @property {number} dy
 */

/**
 * @typedef {Object} DragData
 * @param {ELement} element
 * @property {boolean} actionStarted
 * @property {boolean} dragging
 * @property {number} lastX
 * @property {number} lastY
 * @property {number} startX
 * @property {number} startY
 * @property {number} x
 * @property {number} y
 * @property {Point} lastTouchStartPoint
 * @property {boolean} suppressClickEvent
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
 * Process the start of the action.
 * @param {number} eventSource
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 */
function processStartAction(eventSource, x, y, data) {
  data.actionStarted = true;
  data.dragging = false;
  data.distance = 0;
  data.lastX = x;
  data.lastY = y;
  data.startX = x;
  data.startY = y;
  dispatchEvent(data.element, CUSTOM_POINTER_DOWN_EVENT_NAME, {
    x: x,
    y: y,
  });
}

/**
 * Process the start of the action.
 * @param {number} eventSource
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 */
function processEndAction(eventSource, x, y, data) {
  const eventName = data.dragging
    ? CUSTOM_POINTER_DRAG_END_EVENT_NAME
    : CUSTOM_POINTER_UP_EVENT_NAME;

  data.actionStarted = false;
  data.dragging = false;
  data.distance = 0;
  data.lastX = x;
  data.lastY = y;
  data.startX = x;
  data.startY = y;
  dispatchEvent(data.element, eventName, {
    x: x,
    y: y,
  });
}

/**
 * Process the start of the action.
 * @param {number} eventSource
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 */
function processCancelAction(eventSource, x, y, data) {
  const eventName = CUSTOM_POINTER_CANCEL_EVENT_NAME;

  data.actionStarted = false;
  data.dragging = false;
  data.distance = 0;
  data.lastX = x;
  data.lastY = y;
  data.startX = x;
  data.startY = y;
  dispatchEvent(data.element, eventName, {
    x: x,
    y: y,
  });
}

/**
 * Process the start of the action.
 * @param {number} eventSource
 * @param {number} x - x coordinate relative to target
 * @param {number} y - y coordinate relative to target
 * @param {DragData} data
 * @return {CustomEvent} null if no event should be dispatched.
 */
function processMoveAction(eventSource, x, y, data) {
  const eventName = CUSTOM_POINTER_DRAG_EVENT_NAME;
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
    data.suppressClickEvent = true;
  }
}

/**
 * Add custom listeners which allows an object to listen to touch and mouse events
 * in a consistent manner.
 * the element or clicks. Custom events are sent to differentiate.
 * @param {*} element
 */
export function addPointerListeners(element) {
  let dragData = {
    element: element,
    actionStarted: false,
    dragging: false,
    x: 0,
    y: 0,
    lastTouchStartPoint: null,
    suppressClickEvent: false,
  };

  element.addEventListener(
    'mousedown',
    (event) => {
      LOG.debug('mousedown');
      return processStartAction(
        EventSource.MOUSE,
        event.offsetX,
        event.offsetY,
        dragData
      );
    },
    { passive: true }
  );

  element.addEventListener(
    'mouseup',
    (event) => {
      LOG.debug('mouseup');
      return processEndAction(
        EventSource.MOUSE,
        event.offsetX,
        event.offsetY,
        dragData
      );
    },
    { passive: true }
  );
  element.addEventListener(
    'mousemove',
    (event) => {
      LOG.debug('mousemove');
      if (event.buttons & 1) {
        processMoveAction(
          EventSource.MOUSE,
          event.offsetX,
          event.offsetY,
          dragData
        );
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchstart',
    (event) => {
      LOG.debug('touchstart');
      if (event.changedTouches.length === 1) {
        const offset = getOffsetFromTouch(event);
        dragData.lastTouchStartPoint = new Point(offset.x, offset.y);
        processStartAction(EventSource.TOUCH, offset.x, offset.y, dragData);
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchend',
    (event) => {
      LOG.debug('touchend');
      if (event.changedTouches.length === 1) {
        processEndAction(
          EventSource.TOUCH,
          dragData.lastTouchStartPoint?.x,
          dragData.lastTouchStartPoint?.y,
          dragData
        );
      }
      dragData.lastTouchStartPoint = null;
      dragData.suppressClickEvent = false;
    },
    { passive: true }
  );
  element.addEventListener(
    'touchmove',
    (event) => {
      LOG.debug('touchmove');
      if (event.changedTouches.length === 1) {
        const offset = getOffsetFromTouch(event);
        processMoveAction(EventSource.TOUCH, offset.x, offset.y, dragData);
        dragData.suppressClickEvent = true;
      }
    },
    { passive: true }
  );
  element.addEventListener(
    'touchcancel',
    (event) => {
      LOG.debug('touchcancel');
      processCancelAction(
        EventSource.TOUCH,
        dragData.lastTouchStartPoint?.x,
        dragData.lastTouchStartPoint?.y,
        dragData
      );
      dragData.lastTouchStartPoint = null;
    },

    { passive: true }
  );
  element.addEventListener('click', (event) => {
    LOG.debug('click');
    if (!dragData.suppressClickEvent) {
      dispatchEvent(element, CUSTOM_CLICK_EVENT_NAME, {
        x: event.offsetX,
        y: event.offsetY,
      });
    }
    dragData.suppressClickEvent = false;
  });
}
