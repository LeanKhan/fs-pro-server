/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response } from 'express';

/**
 * Handles all http responses
 * @exports success
 * @exports fail
 */

/**
 * @param  {Object} res
 * @param  {Number} statusCode
 * @param  {String} message
 * @param {Object} additionalFields
 * @returns {Object} null
 */
export function success(
  res: Response,
  statusCode = 200,
  message: string,
  additionalFields: any = {}
) {
  const payload = Array.isArray(additionalFields)
    ? [...additionalFields]
    : { ...additionalFields };

  return res
    .status(statusCode)
    .contentType('json')
    .send(
      JSON.stringify({
        success: true,
        message,
        payload,
      })
    );
}

/**
 * @param  {Object} res
 * @param  {Number} statusCode default is 500
 * @param  {String} message
 * @param {Object} additionalFields
 * @returns {Object} null
 */
export function fail(
  res: Response,
  statusCode = 500,
  message: string,
  additionalFields: any = {}
) {
  let payload;

  if (Array.isArray(additionalFields) || additionalFields instanceof Object) {
    payload = Array.isArray(additionalFields)
      ? [...additionalFields]
      : { ...additionalFields };
  } else {
    try {
      payload = additionalFields.stack || additionalFields.toString();
    } catch (error) {
      console.log('Could not parse error object');
      payload = 'meh :shrug:';
    }
  }

  return res
    .status(statusCode)
    .contentType('json')
    .send(JSON.stringify({ success: false, message, payload }));
}

//   'Borrowed' from isthisarealjob code :)
// -LeanKhan

export default {
  success,
  fail,
};
