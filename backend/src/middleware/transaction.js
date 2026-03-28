const  sequelize= require("../connection/sequelize");
const Models = require("../models/index");

let uuid;

try {
  uuid = require("uuid").v4;
} catch (e) {
  uuid = async () => {
    const { v4 } = await import("uuid");
    return v4();
  };
}
function psqlContextMiddleware(automaticTransaction = false) {
  return async (req, res, next) => {
    const context = {
      req,
      reqTimeStamp: Date.now(),
      traceId: uuid(),
      dbModels: Models,
    };

    if (automaticTransaction) {
    
      const transaction = await sequelize.transaction();
      context.sequelizeTransaction = transaction;
      let transactionHandled = false;
      const handleTransaction = async () => {
        if (transactionHandled) return;
        transactionHandled = true;

        try {
          if (transaction.finished) return;
          const isError =
            res.payload?.errors?.length ||
            !res.payload;
          if (isError) {
            await transaction.rollback();
          } else {
            await transaction.commit();
          }
        } catch (err) {
          if (!transaction.finished) {
            await transaction.rollback();
          }
        }
      };

      res.once("finish", handleTransaction);
      res.once("close", handleTransaction);
    }

    req.context = context;
    next();
  };
}

module.exports = psqlContextMiddleware;