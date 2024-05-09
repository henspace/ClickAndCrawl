/**
 * @file Handle logging. This allows easier access to logs on mobile devices.
 *
 * @module utils/logging
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
 *
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

let messages = [];

/** Add listener for syntax errors. */
window.addEventListener('error', (event) => {
  alert(
    `ERROR: ${event.filename}; line ${event.lineno}\n${event.message}\n:Stack:\n${event.error.stack}`
  );
});

/**
 * Log information.
 * @param  {...any} data
 */
function logGeneral(...data) {
  console.log(...data);
}

/**
 * Log information.
 * @param  {...any} data
 */
function logInfo(...data) {
  console.info(...data);
}

/**
 * Log information.
 * @param  {...any} data
 */
function logDebug(...data) {
  console.debug(...data);
}

/**
 * Log error information.
 * @param  {...any} data
 */
function logError(...data) {
  console.error(...data);
  messages = messages.concat(data);
}

/**
 * Log error information.
 * @param  {Error}} data
 */
function logFatal(error) {
  console.error(error);
  let message;
  if (error.message) {
    message = `${error.message}\nStack:\n${error.stack}`;
  } else {
    message = error;
  }
  alert(`Fatal error: ${message}\nPrevious errors:\n${messages.join('\n')}`);
  messages.push(message);
}

/**
 * Object to access logging routines.
 */
const LOG = {
  log: logGeneral,
  info: logInfo,
  debug: logDebug,
  error: logError,
  fatal: logFatal,
};

export default LOG;
