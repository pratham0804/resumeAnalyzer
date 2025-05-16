import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  resumes: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileId: v.id("_storage"),
    content: v.string(),
    createdAt: v.number(),
    userEmail: v.string(),
  }).index("by_user", ["userId"]),
  
  analyses: defineTable({
    resumeId: v.id("resumes"),
    userId: v.id("users"),
    jobDescription: v.string(),
    matchedSkills: v.array(v.string()),
    missingSkills: v.array(v.string()),
    suggestions: v.array(v.string()),
    score: v.number(),
    createdAt: v.number(),
    userEmail: v.string(),
  }).index("by_resume", ["resumeId"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

Updated on 2025-05-16 10:30:48 - Change #2757

Updated on 2025-05-16 10:30:53 - Change #7577

Updated on 2025-05-16 10:30:57 - Change #5506

Updated on 2025-05-16 10:31:02 - Change #3970

Updated on 2025-05-16 10:31:14 - Change #5870

Updated on 2025-05-16 10:31:18 - Change #2757

Updated on 2025-05-16 10:31:24 - Change #2489

Updated on 2025-05-16 10:31:29 - Change #2171

Updated on 2025-05-16 10:31:43 - Change #2546
