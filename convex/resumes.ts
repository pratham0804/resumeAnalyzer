import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveResume = mutation({
  args: {
    fileId: v.id("_storage"),
    fileName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("resumes", {
      userId,
      fileId: args.fileId,
      fileName: args.fileName,
      content: args.content,
      createdAt: Date.now(),
      userEmail: (await ctx.auth.getUserIdentity())?.email || "",
    });
  },
});

export const analyzeResume = mutation({
  args: {
    resumeId: v.id("resumes"),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const resume = await ctx.db.get(args.resumeId);
    if (!resume) throw new Error("Resume not found");

    await ctx.scheduler.runAfter(0, api.resumes.performAnalysis, {
      resumeId: args.resumeId,
      jobDescription: args.jobDescription,
    });

    return null;
  },
});

export const performAnalysis = action({
  args: {
    resumeId: v.id("resumes"),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.runQuery(api.resumes.getResume, { resumeId: args.resumeId });
    if (!resume) throw new Error("Resume not found");

    // Initialize Gemini API with the key from environment variable
    // For now we'll use the hardcoded key since we couldn't create the .env file
    const apiKey = "AIzaSyClumkdXYr7QkIxl-sHFoB3Rjgtvrf59vc";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this resume for the following job description. Format your response exactly like this:
MATCHED SKILLS:
- List each matched skill on a new line starting with -
MISSING SKILLS:
- List each missing skill on a new line starting with -
SUGGESTIONS:
- List each suggestion on a new line starting with -
SCORE: Give a number between 0-100

Job Description:
${args.jobDescription}

Resume Content:
${resume.content}`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Parse the response
      const sections = text.split('\n\n');
      const matchedSkills = sections
        .find(s => s.startsWith('MATCHED SKILLS:'))
        ?.split('\n')
        .slice(1)
        .map(s => s.trim())
        .filter(s => s.startsWith('-'))
        .map(s => s.substring(1).trim()) || [];

      const missingSkills = sections
        .find(s => s.startsWith('MISSING SKILLS:'))
        ?.split('\n')
        .slice(1)
        .map(s => s.trim())
        .filter(s => s.startsWith('-'))
        .map(s => s.substring(1).trim()) || [];

      const suggestions = sections
        .find(s => s.startsWith('SUGGESTIONS:'))
        ?.split('\n')
        .slice(1)
        .map(s => s.trim())
        .filter(s => s.startsWith('-'))
        .map(s => s.substring(1).trim()) || [];

      const scoreMatch = text.match(/SCORE:\s*(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

      await ctx.runMutation(api.resumes.saveAnalysis, {
        resumeId: args.resumeId,
        matchedSkills,
        missingSkills,
        suggestions,
        score,
        jobDescription: args.jobDescription,
      });
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to analyze resume");
    }
  },
});

export const saveAnalysis = mutation({
  args: {
    resumeId: v.id("resumes"),
    jobDescription: v.string(),
    matchedSkills: v.array(v.string()),
    missingSkills: v.array(v.string()),
    suggestions: v.array(v.string()),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("analyses", {
      userId,
      resumeId: args.resumeId,
      jobDescription: args.jobDescription,
      matchedSkills: args.matchedSkills,
      missingSkills: args.missingSkills,
      suggestions: args.suggestions,
      score: args.score,
      createdAt: Date.now(),
      userEmail: (await ctx.auth.getUserIdentity())?.email || "",
    });
  },
});

export const getResume = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resumeId);
  },
});

export const listResumes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("resumes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAnalysis = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_resume", (q) => q.eq("resumeId", args.resumeId))
      .order("desc")
      .take(1);
      
    return analyses[0] || null;
  },
});

Updated on 2025-05-16 10:30:45 - Change #4370

Updated on 2025-05-16 10:30:50 - Change #7904
