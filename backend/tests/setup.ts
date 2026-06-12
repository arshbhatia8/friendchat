import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

export default async function setup(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI      = mongod.getUri();
  process.env.MONGODB_URI_TEST = mongod.getUri();
  // Stub CometChat env vars so config/env doesn't throw
  process.env.JWT_SECRET          = "test_jwt_secret_that_is_long_enough_64chars_padding_xxxx";
  process.env.JWT_REFRESH_SECRET  = "test_refresh_secret_that_is_long_enough_64chars_pyyy";
  process.env.COMETCHAT_APP_ID    = "test_app_id";
  process.env.COMETCHAT_API_KEY   = "test_api_key";
  process.env.COMETCHAT_AUTH_KEY  = "test_auth_key";
  (global as Record<string, unknown>).__MONGOD__ = mongod;
}
