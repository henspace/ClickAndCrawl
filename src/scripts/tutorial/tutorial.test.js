/**
 * @file Test tutorial
 *
 * @module tutorial/tutorial.test
 */
/**
 * license {@link https://opensource.org/license/mit/|MIT}
 * Copyright 2024 Steve Butler (henspace.com).
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

import { Situation, TUTORIAL } from './tutorial.js';
import { jest, test, expect } from '@jest/globals';

test('present: no presenter set.', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  await TUTORIAL.present(Situation.ENTRY, 'message');
  expect(presenter).toBeCalledTimes(0);
});

test('present: presenter set but not started.', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  await TUTORIAL.present(Situation.ENTRY, 'message');
  expect(presenter).toBeCalledTimes(0);
});

test('start and present: presenter set and started.', async () => {
  const presenter = jest.fn((textUnused, positionUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message');
  expect(presenter).toBeCalledTimes(1);
});

test('start and present: presenter set and started.', async () => {
  const presenter = jest.fn((textUnused, positionUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  await TUTORIAL.present(Situation.INTERACTION, 'message interaction');
  await TUTORIAL.present(Situation.MOVEMENT, 'message movement');
  expect(presenter).toBeCalledTimes(3);
  expect(presenter.mock.calls[0][0]).toBe('message entry');
  expect(presenter.mock.calls[1][0]).toBe('message interaction');
  expect(presenter.mock.calls[2][0]).toBe('message movement');
});

test('present passed position.', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  const position = { x: 1, y: 2 };
  await TUTORIAL.present(Situation.ENTRY, 'message entry', position);
  expect(presenter).toBeCalledTimes(1);
  expect(presenter.mock.calls[0][0]).toBe('message entry');
  expect(presenter.mock.calls[0][1]).toStrictEqual(position);
});

test('start and present: each situation shown once', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message entry 0');
  await TUTORIAL.present(Situation.ENTRY, 'message entry 1');
  await TUTORIAL.present(Situation.ENTRY, 'message entry 2');
  await TUTORIAL.present(Situation.INTERACTION, 'message interaction');
  expect(presenter).toBeCalledTimes(2);
  expect(presenter.mock.calls[0][0]).toBe('message entry 0');
  expect(presenter.mock.calls[1][0]).toBe('message interaction');
});

test('start: each situation shown once until restarted', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  expect(presenter).toBeCalledTimes(1);
  expect(presenter.mock.calls[0][0]).toBe('message entry');
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  expect(presenter).toBeCalledTimes(2);
  expect(presenter.mock.calls[1][0]).toBe('message entry');
});

test('end: ends the tutorial', async () => {
  const presenter = jest.fn((textUnused) => Promise.resolve());
  TUTORIAL.setPresenter(presenter);
  TUTORIAL.start();
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  TUTORIAL.end();
  await TUTORIAL.present(Situation.MOVEMENT, 'message movement');
  expect(presenter).toBeCalledTimes(1);
  expect(presenter.mock.calls[0][0]).toBe('message entry');
});

test('willPresent', async () => {
  expect(TUTORIAL.willPresent(Situation.ENTRY)).toBe(false);
  TUTORIAL.start();
  expect(TUTORIAL.willPresent(Situation.ENTRY)).toBe(true);
  await TUTORIAL.present(Situation.ENTRY, 'message entry');
  expect(TUTORIAL.willPresent(Situation.ENTRY)).toBe(false);
});

test('isComplete', async () => {
  expect(TUTORIAL.isComplete()).toBe(false);
  await TUTORIAL.present(Situation.ENTRY, 'message');
  expect(TUTORIAL.isComplete()).toBe(false);
  await TUTORIAL.present(Situation.EXIT, 'message');
  expect(TUTORIAL.isComplete()).toBe(false);
  await TUTORIAL.present(Situation.INTERACTION, 'message');
  expect(TUTORIAL.isComplete()).toBe(false);
  await TUTORIAL.present(Situation.HERO, 'message');
  expect(TUTORIAL.isComplete()).toBe(false);
  await TUTORIAL.present(Situation.MOVEMENT, 'message');
  expect(TUTORIAL.isComplete()).toBe(true);
});
