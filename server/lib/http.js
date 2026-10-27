const mongoose = require('mongoose');
function fail(status, message, type) {
  const error = new Error(message);
  error.status = status;
  error.type = type;
  throw error;
}
const route = handler => async (req, res, next) => {
  try { await handler(req, res); } catch (error) { next(error); }
};
async function transaction(handler) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => { result = await handler(session); });
    return result;
  } finally { await session.endSession(); }
}
module.exports = { fail, route, transaction };
