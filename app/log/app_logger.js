//dependencies------------------------------------------------------------------
const { createLogger, format, transports } = require("winston");

const app_logger = createLogger({
    level: 'warn',
    transports: [
      new transports.Console(),
      new transports.File({ filename: './log/app.log' })
    ],
    format: format.combine(
      format.label({
          label:'[LEVEL]'
      }),
      format.timestamp({
          format:"YY-MM-DD HH:mm:ss"
      }),
      format.printf(
          info => `[${info.level}] `.toUpperCase() + `${info.timestamp}  ${info.context} : ${info.message}`
      )),
});
  
// Exporting variables and functions
module.exports = {app_logger}