import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState, useRef } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Resume Analyzer</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const saveResume = useMutation(api.resumes.saveResume);
  const analyzeResume = useMutation(api.resumes.analyzeResume);
  const resumes = useQuery(api.resumes.listResumes) || [];
  
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  
  const analysis = useQuery(
    api.resumes.getAnalysis,
    selectedResume ? { resumeId: selectedResume._id } : "skip"
  );

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      const content = await file.text();
      const resumeId = await saveResume({
        fileId: storageId,
        fileName: file.name,
        content,
      });
      
      toast.success("Resume uploaded successfully!");
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error(error);
    }
  }

  async function handleAnalyze() {
    if (!selectedResume || !jobDescription) {
      toast.error("Please select a resume and enter a job description");
      return;
    }

    try {
      await analyzeResume({
        resumeId: selectedResume._id,
        jobDescription,
      });
      toast.success("Analysis started with Gemini AI! This may take a few moments...");
    } catch (error) {
      toast.error("Failed to analyze resume");
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Resume Analyzer</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to get started</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Upload Resume</h3>
              <input
                type="file"
                ref={fileInput}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx"
                className="w-full"
              />
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Your Resumes</h3>
              <div className="space-y-2">
                {resumes.length === 0 ? (
                  <p className="text-gray-500">No resumes uploaded yet</p>
                ) : (
                  resumes.map((resume) => (
                    <button
                      key={resume._id}
                      onClick={() => {
                        console.log("Selected resume:", resume);
                        setSelectedResume(resume);
                      }}
                      className={`w-full p-2 text-left rounded ${
                        selectedResume?._id === resume._id
                          ? "bg-indigo-100 text-indigo-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {resume.fileName}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Job Description</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-40 p-2 border rounded"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {selectedResume ? `Selected: ${selectedResume.fileName}` : 'No resume selected'}
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedResume || !jobDescription}
                  className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze with Gemini
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Analysis Results <span className="text-sm text-indigo-600">(Powered by Gemini 2.0 Flash)</span>
            </h3>
            {analysis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600">Matched Skills</h4>
                  <ul className="list-disc pl-5">
                    {analysis.matchedSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-600">Missing Skills</h4>
                  <ul className="list-disc pl-5">
                    {analysis.missingSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-600">Suggestions</h4>
                  <ul className="list-disc pl-5">
                    {analysis.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium">Match Score</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2">{analysis.score}%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Select a resume and job description, then click "Analyze with Gemini" to see results.
              </p>
            )}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

Updated on 2025-05-16 10:30:59 - Change #4311

Updated on 2025-05-16 10:31:10 - Change #5370

Updated on 2025-05-16 10:31:45 - Change #4659

Updated on 2025-05-16 10:31:46 - Change #4552
