import mongoose from "mongoose";

const isValidObjectId = id =>
  mongoose.Types.ObjectId.isValid(id);

export default isValidObjectId;