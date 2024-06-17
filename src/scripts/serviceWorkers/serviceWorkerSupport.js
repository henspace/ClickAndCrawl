/**
 * @file Support utilities for the service worker.
 *
 * @module serviceWorkers/serviceWorkerSupport
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

/**
 * Function that can be called to delete all caches in the service worker.
 * Created in this utility to all modules that would not need to know about
 * the service worker implementation from being directly linked to the @parcel
 * service-worker utilities which cause issues with jest.
 * @param {function} fn
 */
let deleteAllCaches;

/**
 * Service worker support object.
 */
const SERVICE_WORKER_SUPPORT = {
  setDeleteAllCachesFunction: (fn) => (deleteAllCaches = fn),
  deleteAllCaches: () => deleteAllCaches?.(),
};

export default SERVICE_WORKER_SUPPORT;
