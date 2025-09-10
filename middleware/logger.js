export const logger = (req, res, next) => {
    const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl}`;
    console.log(log); // You can later save logs in DB or a file
    next();
  };
  