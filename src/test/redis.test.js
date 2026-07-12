
import "dotenv/config";
import { redis } from "../config/redis.js";

const test = async () => {
  try {
    await redis.set("hello", "world");

    const value = await redis.get("hello");

    console.log(value);

  } catch (error) {
    console.error(error);
  }
};

test();