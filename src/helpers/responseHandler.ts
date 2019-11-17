import { Response } from 'express';

/**
 * Handles all http responses
 * @exports respondWithSuccess
 * @exports respondWithWarning
 */

/**
 * @param  {Object} res
 * @param  {Number} statusCode
 * @param  {String} message
 * @param {Object} additionalFields
 * @returns {Object} null
 */
const respondWithSuccess = (
  res: Response,
  statusCode: number = 200,
  message: string,
  additionalFields: object = {}
): object => {
  const payload = Array.isArray(additionalFields)
    ? [...additionalFields]
    : { ...additionalFields };

  return res.status(statusCode).send(
    JSON.stringify({
      success: true,
      message,
      payload,
    })
  );
};

/**
 * @param  {Object} res
 * @param  {Number} statusCode default is 500
 * @param  {String} message
 * @param {Object} additionalFields
 * @returns {Object} null
 */
const respondWithError = (
  res: Response,
  statusCode: number = 500,
  message: string,
  additionalFields: object = {}
): object => {
  const payload = Array.isArray(additionalFields)
    ? [...additionalFields]
    : { ...additionalFields };
  return res
    .status(statusCode)
    .send(JSON.stringify({ success: false, message, payload }));
};

//   'Borrowed' from isthisarealjob code :)
// -LeanKhan

export default {
    success: respondWithSuccess,
    fail: respondWithError
}