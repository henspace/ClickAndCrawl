/**
 * @file Test toxins
 *
 *
 * @module dnd\toxins.test
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
import { Toxin } from './toxins.js';
import { test, expect } from '@jest/globals';

test('Toxin.constructor', () => {
  let toxin = new Toxin();
  expect(toxin.isActive).toBe(false);
  toxin = new Toxin(10);
  expect(toxin.isActive).toBe(true);
  expect(toxin.getChangeInHpThisTurn()).toBe(10);

  toxin = new Toxin(10, 30);
  expect(toxin.isActive).toBe(true);
  expect(toxin.getChangeInHpThisTurn()).toBe(40);
});

test('Toxin.getChangeInHpThisTurn()', () => {
  const toxin = new Toxin(2.5);
  for (let turn = 1; turn < 50; turn += 2) {
    expect(toxin.getChangeInHpThisTurn()).toEqual(2);
    expect(toxin.getChangeInHpThisTurn()).toEqual(3);
  }
});

test('Toxin.addToxicEffect()', () => {
  const toxin = new Toxin(2.5);
  expect(toxin.getChangeInHpThisTurn()).toEqual(2);
  expect(toxin.getChangeInHpThisTurn()).toEqual(3);
  toxin.addToxicEffect(10);
  expect(toxin.getChangeInHpThisTurn()).toEqual(12);
  expect(toxin.getChangeInHpThisTurn()).toEqual(13);
});

test('Toxin.cure()', () => {
  const toxin = new Toxin(2.5);
  expect(toxin.getChangeInHpThisTurn()).toEqual(2);
  expect(toxin.getChangeInHpThisTurn()).toEqual(3);
  toxin.cure();
  expect(toxin.getChangeInHpThisTurn()).toEqual(0);
  expect(toxin.getChangeInHpThisTurn()).toEqual(0);
});

test('Toxin.isActive', () => {
  let toxin = new Toxin(0);
  expect(toxin.isActive).toBe(false);
  toxin = new Toxin(2.5);
  expect(toxin.isActive).toBe(true);
  toxin.cure();
  expect(toxin.isActive).toBe(false);
});

test('toJSON and revive', () => {
  const original = new Toxin(25, 30);
  const asJson = JSON.stringify(original);
  const revived = JSON.parse(asJson, (key, value) => {
    if (value.reviver === 'Toxin') {
      return Toxin.revive(value.data);
    } else {
      return value;
    }
  });
  expect(original.getChangeInHpThisTurn()).toEqual(55);
  expect(revived.getChangeInHpThisTurn()).toEqual(55);
});
