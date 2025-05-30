/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as resumes from "../resumes.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  resumes: typeof resumes;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

Updated on 2025-05-16 10:31:12 - Change #3821

Updated on 2025-05-16 10:31:15 - Change #7456

Updated on 2025-05-16 10:31:17 - Change #4751

Updated on 2025-05-16 10:31:25 - Change #7158

Updated on 2025-05-16 10:31:27 - Change #1117

Updated on 2025-05-16 10:31:36 - Change #4991

Updated on 2025-05-16 10:31:38 - Change #4316

Updated on 2025-05-16 10:31:40 - Change #8104

Updated on 2025-05-16 10:31:46 - Change #4434
