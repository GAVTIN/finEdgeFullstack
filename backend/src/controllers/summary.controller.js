const { getSummary } = require('../services/summaryService');

async function summary(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const result = await getSummary(req.user.id, { startDate, endDate });

    res.status(200).json({
      status: 'success',
      cached: result.fromCache,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary };
