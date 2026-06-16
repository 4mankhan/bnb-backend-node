const asyncHandler = (fn) => {
  return (req, res, next) => {
    //  console.log("catchinnnnnnnnnnnnnn")
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
