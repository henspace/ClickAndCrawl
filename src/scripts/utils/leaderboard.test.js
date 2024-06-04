/**
 * @file Test for leaderboard
 *
 * @module utils/leaderboard.test
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

import { test, expect } from '@jest/globals';
import { Leaderboard } from './leaderBoard.js';

test('constructor, getCurrent() and getMaxLength()', () => {
  let leaderboard = new Leaderboard();
  expect(leaderboard.getCurrentData()).toStrictEqual([]);
  expect(leaderboard.getMaxLength()).toBe(10);
  const testArray = ['lion', 'tiger', 'bear'];
  leaderboard = new Leaderboard(testArray);
  expect(leaderboard.getCurrentData()).toStrictEqual(testArray);
  expect(leaderboard.getMaxLength()).toBe(10);
  leaderboard = new Leaderboard(testArray, { maxLength: 20 });
  expect(leaderboard.getCurrentData()).toStrictEqual(testArray);
  expect(leaderboard.getMaxLength()).toBe(20);
});

test('add: worst', () => {
  const maxLength = 4;
  const leaderBoard = new Leaderboard(['alpha'], { maxLength: maxLength });
  expect(leaderBoard.getCurrentData()).toEqual(['alpha'], {
    maxLength: maxLength,
    sortFn: (a, b) => (a < b ? -1 : 1),
  });
  expect(leaderBoard.add('beta')).toEqual(1);
  expect(leaderBoard.getCurrentData()).toEqual(['alpha', 'beta']);
  expect(leaderBoard.add('delta')).toEqual(2);
  expect(leaderBoard.getCurrentData()).toEqual(['alpha', 'beta', 'delta']);
  expect(leaderBoard.add('gamma')).toEqual(3);
  expect(leaderBoard.getCurrentData()).toEqual([
    'alpha',
    'beta',
    'delta',
    'gamma',
  ]);
  expect(leaderBoard.add('omega')).toEqual(-1);
  expect(leaderBoard.getCurrentData()).toEqual([
    'alpha',
    'beta',
    'delta',
    'gamma',
  ]);
});

test('add: best', () => {
  const maxLength = 4;
  const leaderBoard = new Leaderboard(['alpha'], {
    maxLength: maxLength,
    sortFn: (a, b) => (a < b ? 1 : -1),
  });
  expect(leaderBoard.getCurrentData()).toEqual(['alpha']);

  expect(leaderBoard.add('beta')).toEqual(0);
  expect(leaderBoard.getCurrentData()).toEqual(['beta', 'alpha']);

  expect(leaderBoard.add('delta')).toEqual(0);
  expect(leaderBoard.getCurrentData()).toEqual(['delta', 'beta', 'alpha']);

  expect(leaderBoard.add('gamma')).toEqual(0);
  expect(leaderBoard.getCurrentData()).toEqual([
    'gamma',
    'delta',
    'beta',
    'alpha',
  ]);

  expect(leaderBoard.add('omega')).toEqual(0);
  expect(leaderBoard.getCurrentData()).toEqual([
    'omega',
    'gamma',
    'delta',
    'beta',
  ]);
});

test('add: middle', () => {
  const maxLength = 4;
  const leaderBoard = new Leaderboard(['alpha', 'beta', 'omega'], {
    maxLength: maxLength,
    sortFn: (a, b) => (a < b ? -1 : 1),
  });

  expect(leaderBoard.add('lambda')).toEqual(2);
  expect(leaderBoard.getCurrentData()).toEqual([
    'alpha',
    'beta',
    'lambda',
    'omega',
  ]);

  expect(leaderBoard.add('delta', (a, b) => (a < b ? -1 : 1))).toEqual(2);
  expect(leaderBoard.getCurrentData()).toEqual([
    'alpha',
    'beta',
    'delta',
    'lambda',
  ]);
});

test('add: replace existing if better', () => {
  // sort by descending score.
  // test equality by hashCode.
  const leaderBoard = new Leaderboard(
    [
      { name: 'alpha', hashCode: 111, score: 50 },
      { name: 'beta', hashCode: 222, score: 100 },
      { name: 'gamma', hasCode: 333, score: 10 },
    ],
    {
      maxLength: 4,
      sortFn: (a, b) => (a.score > b.score ? -1 : 1),
      equalFn: (a, b) => a.hashCode === b.hashCode,
    }
  );
  expect(leaderBoard.add({ name: 'alpha', hashCode: 444, score: 20 })).toEqual(
    2
  );
  expect(leaderBoard.getCurrentData()).toEqual([
    { name: 'beta', hashCode: 222, score: 100 },
    { name: 'alpha', hashCode: 111, score: 50 },
    { name: 'alpha', hashCode: 444, score: 20 },
    { name: 'gamma', hasCode: 333, score: 10 },
  ]);

  expect(leaderBoard.add({ name: 'alpha', hashCode: 444, score: 99 })).toEqual(
    1
  );
  expect(leaderBoard.getCurrentData()).toEqual([
    { name: 'beta', hashCode: 222, score: 100 },
    { name: 'alpha', hashCode: 444, score: 99 },
    { name: 'alpha', hashCode: 111, score: 50 },
    { name: 'gamma', hasCode: 333, score: 10 },
  ]);
});

test('add: discard if existing is better', () => {
  // sort by descending score.
  // test equality by hashCode.
  const leaderBoard = new Leaderboard(
    [
      { name: 'alpha', hashCode: 111, score: 50 },
      { name: 'beta', hashCode: 222, score: 100 },
      { name: 'gamma', hasCode: 333, score: 10 },
    ],
    {
      maxLength: 4,
      sortFn: (a, b) => (a.score > b.score ? -1 : 1),
      equalFn: (a, b) => a.hashCode === b.hashCode,
    }
  );
  expect(leaderBoard.add({ name: 'alpha', hashCode: 444, score: 20 })).toEqual(
    2
  );
  expect(leaderBoard.getCurrentData()).toEqual([
    { name: 'beta', hashCode: 222, score: 100 },
    { name: 'alpha', hashCode: 111, score: 50 },
    { name: 'alpha', hashCode: 444, score: 20 },
    { name: 'gamma', hasCode: 333, score: 10 },
  ]);

  expect(leaderBoard.add({ name: 'alpha', hashCode: 444, score: 19 })).toEqual(
    2
  );
  expect(leaderBoard.getCurrentData()).toEqual([
    { name: 'beta', hashCode: 222, score: 100 },
    { name: 'alpha', hashCode: 111, score: 50 },
    { name: 'alpha', hashCode: 444, score: 20 },
    { name: 'gamma', hasCode: 333, score: 10 },
  ]);
});
