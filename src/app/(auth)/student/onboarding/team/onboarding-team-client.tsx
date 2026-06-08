"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Orbit,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Key,
  Send,
  Clock,
  Sparkles,
  Building,
  User,
  Hash,
  FileText,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signOutFromSession } from "@/services/auth-service";

type PendingRequestType = {
  id: string;
  collegeName: string;
  department: string;
  section: string;
  facultyName: string;
  notes: string | null;
  status: string;
  createdAt: Date;
} | null;

type OnboardingTeamClientProps = {
  userName: string;
  pendingRequest: PendingRequestType;
};

export function OnboardingTeamClient({ userName, pendingRequest: initialPendingRequest }: OnboardingTeamClientProps) {
  const router = useRouter();
  
  // Set initial tab to "pending" if there's a pending request, otherwise default to "join"
  const [activeTab, setActiveTab] = useState<"join" | "request" | "pending">(
    initialPendingRequest ? "pending" : "join"
  );
  
  const [loading, setLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMode, setSuccessMode] = useState<"join" | "request" | null>(null);
  
  // Local pending request representation so we can update in-place without page reload if they submit
  const [localPendingRequest, setLocalPendingRequest] = useState<PendingRequestType>(initialPendingRequest);

  // Form States
  const [teamCode, setTeamCode] = useState("");
  const [requestData, setRequestData] = useState({
    collegeName: "",
    department: "",
    section: "",
    facultyName: "",
    notes: "",
  });

  // Handle Logout / Escape Route
  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setError(null);
    
    try {
      const result = await signOutFromSession();
      if (!result.success) {
        setIsSigningOut(false);
        toast.error(result.message || "Failed to log out");
        return;
      }
      toast.success("Signed out successfully");
      router.replace("/auth/login");
    } catch (err) {
      console.error(err);
      setIsSigningOut(false);
      toast.error("An error occurred while signing out.");
    }
  }

  // Handle Join Submit
  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = teamCode.trim();
    if (!code) {
      setError("Team Code cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Invalid Team Code. Please contact your faculty.");
        setLoading(false);
        return;
      }

      toast.success("Joined team successfully!");
      setSuccessMode("join");
      
      setTimeout(() => {
        router.refresh();
        router.push("/student/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  // Handle Request Submit
  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { collegeName, department, section, facultyName, notes } = requestData;

    if (
      !collegeName.trim() ||
      !department.trim() ||
      !section.trim() ||
      !facultyName.trim()
    ) {
      setError("All fields except Additional Notes are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/team/request-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName: collegeName.trim(),
          department: department.trim(),
          section: section.trim(),
          facultyName: facultyName.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to submit request.");
        setLoading(false);
        return;
      }

      toast.success("Request submitted successfully!");
      setSuccessMode("request");

      // Update local pending request details for rendering in "pending" view
      setLocalPendingRequest({
        id: data.requestId || "new-request",
        collegeName: collegeName.trim(),
        department: department.trim(),
        section: section.trim(),
        facultyName: facultyName.trim(),
        notes: notes.trim() || null,
        status: "pending",
        createdAt: new Date(),
      });

      // Clear forms
      setRequestData({
        collegeName: "",
        department: "",
        section: "",
        facultyName: "",
        notes: "",
      });

      setTimeout(() => {
        setSuccessMode(null);
        setActiveTab("pending");
        setLoading(false);
        router.refresh(); // Refresh route data in background
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-primary/5 dark:bg-primary/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="w-full max-w-[600px] z-10 flex flex-col gap-6">
        
        {/* App Brand Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-white dark:bg-zinc-900 shadow-sm text-foreground">
            <Orbit className="size-6 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-display">JetLabs</h2>
            <p className="text-xs text-muted-foreground">Classroom Learning OS</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Success Mode overlay inside card container */}
          {successMode ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-border/80 bg-white dark:bg-zinc-900/90 shadow-xl rounded-2xl text-center p-8 sm:p-12">
                <CardContent className="flex flex-col items-center justify-center space-y-5 pt-6">
                  <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-10 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold font-display">
                      {successMode === "join" ? "Successfully Joined!" : "Request Submitted!"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {successMode === "join" 
                        ? "You are now assigned to your workspace. Setting up your profile..." 
                        : "Your assignment request has been sent successfully. Redirecting you to status details..."}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground/80 bg-slate-50 dark:bg-zinc-800/50 px-4 py-2 rounded-full border border-border/50">
                    <LoaderCircle className="size-3.5 animate-spin text-primary" />
                    <span>Synchronizing session...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card className="border border-border/80 bg-white dark:bg-zinc-900/90 shadow-xl rounded-2xl overflow-hidden">
                
                {/* Header Welcome Text */}
                <CardHeader className="space-y-2 border-b border-border/60 pb-6 bg-slate-50/50 dark:bg-zinc-800/30 px-6 sm:px-8 pt-8">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-foreground font-display">
                      Welcome, {userName}!
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      Let's get your workspace set up. Please join a team using a code or request assignment from your instructor.
                    </CardDescription>
                  </div>

                  {/* Tabs toggle when not in pending mode */}
                  {activeTab !== "pending" && (
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 dark:bg-zinc-800/80 rounded-xl mt-4 border border-border/50">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setActiveTab("join");
                        }}
                        className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                          activeTab === "join"
                            ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-700/30"
                        }`}
                      >
                        <Key className="size-3.5" />
                        Join via Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setActiveTab("request");
                        }}
                        className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                          activeTab === "request"
                            ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-zinc-700/30"
                        }`}
                      >
                        <Send className="size-3.5" />
                        Request Assignment
                      </button>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  
                  {/* Alert error panel */}
                  {error && (
                    <div
                      role="alert"
                      className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6"
                    >
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {/* VIEW 1: JOIN TEAM FORM */}
                  {activeTab === "join" && (
                    <form onSubmit={handleJoinSubmit} className="space-y-6">
                      <div className="space-y-2.5">
                        <label htmlFor="teamCode" className="text-sm font-semibold text-foreground">
                          Enter Team Code
                        </label>
                        <Input
                          id="teamCode"
                          type="text"
                          className="h-12 border-border/80 bg-slate-50/50 focus-visible:bg-white text-base md:text-sm uppercase tracking-wider font-semibold placeholder:normal-case placeholder:font-normal"
                          placeholder="JTL-XXXX-YY"
                          value={teamCode}
                          onChange={(e) => {
                            setError(null);
                            setTeamCode(e.target.value);
                          }}
                          disabled={loading}
                          autoFocus
                          required
                        />
                        <p className="text-xs text-muted-foreground leading-normal">
                          Provided by your instructor. Format usually resembles <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[10px]">JTL-2026-A12</code>.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          className="h-12 w-full text-base font-semibold transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <LoaderCircle className="size-5 animate-spin mr-1" />
                              Verifying Code...
                            </>
                          ) : (
                            <>
                              Join Team Workspace
                              <ArrowRight className="size-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Benefits / Info Section */}
                      <div className="border-t border-border/60 pt-6 mt-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-4">
                          Why join a Team Workspace?
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 text-sm">
                            <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                              <Orbit className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Workspace Collaboration</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Share repositories, code segments, and documentation with team members.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-sm">
                            <div className="size-7 rounded-lg bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                              <Sparkles className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Guided Semester Milestones</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Structured pathways tailored by your faculty keeps team tasks on schedule.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-sm">
                            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Direct Faculty Reviews</p>
                              <p className="text-xs text-muted-foreground mt-0.5">Submit reviews, schedule presentations, and log updates directly in one place.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* VIEW 2: REQUEST ASSIGNMENT FORM */}
                  {activeTab === "request" && (
                    <form onSubmit={handleRequestSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label htmlFor="collegeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                            College / Institution
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="collegeName"
                              type="text"
                              className="h-11 pl-9 border-border/80 bg-slate-50/50 focus-visible:bg-white"
                              placeholder="e.g. JetLabs Institute"
                              value={requestData.collegeName}
                              onChange={(e) => {
                                setError(null);
                                setRequestData({ ...requestData, collegeName: e.target.value });
                              }}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="department" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                            Department
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="department"
                              type="text"
                              className="h-11 pl-9 border-border/80 bg-slate-50/50 focus-visible:bg-white"
                              placeholder="e.g. Computer Science"
                              value={requestData.department}
                              onChange={(e) => {
                                setError(null);
                                setRequestData({ ...requestData, department: e.target.value });
                              }}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label htmlFor="section" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                            Class Section
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="section"
                              type="text"
                              className="h-11 pl-9 border-border/80 bg-slate-50/50 focus-visible:bg-white"
                              placeholder="e.g. Section A"
                              value={requestData.section}
                              onChange={(e) => {
                                setError(null);
                                setRequestData({ ...requestData, section: e.target.value });
                              }}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="facultyName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                            Faculty / Mentor Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              id="facultyName"
                              type="text"
                              className="h-11 pl-9 border-border/80 bg-slate-50/50 focus-visible:bg-white"
                              placeholder="e.g. Dr. Nisha Varma"
                              value={requestData.facultyName}
                              onChange={(e) => {
                                setError(null);
                                setRequestData({ ...requestData, facultyName: e.target.value });
                              }}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
                          Additional Details (Optional)
                        </label>
                        <Textarea
                          id="notes"
                          className="min-h-[90px] border-border/80 bg-slate-50/50 focus-visible:bg-white py-3"
                          placeholder="Provide project name or other details that help faculty identify you..."
                          value={requestData.notes}
                          onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                          disabled={loading}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          className="h-12 w-full text-base font-semibold transition-all duration-200"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <LoaderCircle className="size-5 animate-spin mr-1" />
                              Submitting Request...
                            </>
                          ) : (
                            <>
                              Submit Request
                              <Send className="size-3.5 ml-1.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* VIEW 3: PENDING APPROVAL VIEW */}
                  {activeTab === "pending" && localPendingRequest && (
                    <div className="space-y-6">
                      
                      {/* Big Warning/Pending alert card */}
                      <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/10 p-5 flex items-start gap-4">
                        <div className="rounded-lg bg-amber-100 dark:bg-amber-950/50 p-2.5 text-amber-700 dark:text-amber-400 shrink-0">
                          <Clock className="size-6 animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-amber-950 dark:text-amber-200 leading-none">
                            Assignment Request Pending
                          </h4>
                          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                            Your assignment details have been logged and are waiting for confirmation from your Faculty Advisor, <strong className="text-amber-950 dark:text-amber-200">{localPendingRequest.facultyName}</strong>. 
                          </p>
                          <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 pt-1">
                            Submitted on {new Date(localPendingRequest.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Request Details Grid */}
                      <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-border/60 p-5 space-y-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                          Submitted Request Details
                        </h5>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block mb-0.5">College / Institution</span>
                            <span className="font-semibold text-foreground">{localPendingRequest.collegeName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Department</span>
                            <span className="font-semibold text-foreground">{localPendingRequest.department}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Class Section</span>
                            <span className="font-semibold text-foreground">{localPendingRequest.section}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-0.5">Faculty Contact</span>
                            <span className="font-semibold text-foreground">{localPendingRequest.facultyName}</span>
                          </div>
                        </div>

                        {localPendingRequest.notes && (
                          <div className="text-xs border-t border-border/50 pt-3 mt-3">
                            <span className="text-muted-foreground block mb-1">Additional Details</span>
                            <p className="text-foreground bg-white dark:bg-zinc-900 border border-border/40 p-2.5 rounded-lg italic">
                              "{localPendingRequest.notes}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Alternate Bypass Route */}
                      <div className="border-t border-border/60 pt-6 mt-6 flex flex-col items-center gap-3">
                        <p className="text-xs text-muted-foreground text-center">
                          If your faculty advisor gave you a Team Code recently, you can enter it here to join immediately.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 text-xs font-semibold gap-1.5"
                          onClick={() => {
                            setError(null);
                            setActiveTab("join");
                          }}
                        >
                          <Key className="size-3.5" />
                          Enter Team Code Instead
                        </Button>
                      </div>

                    </div>
                  )}

                </CardContent>

                {/* Switch tab footer for Request screen */}
                {activeTab === "request" && (
                  <CardFooter className="bg-slate-50/50 dark:bg-zinc-800/20 border-t border-border/60 p-4 px-6 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Already have a Team Code?</span>
                    <button
                      type="button"
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                      onClick={() => {
                        setError(null);
                        setActiveTab("join");
                      }}
                    >
                      <ArrowLeft className="size-3" />
                      Back to Code Join
                    </button>
                  </CardFooter>
                )}

              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Escape Routes Footer Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground/80 mt-2">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <LogOut className="size-3" />
            Back to Login
          </button>
          <span className="w-1 h-1 rounded-full bg-border" />
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
          >
            Switch Account
          </button>
          <span className="w-1 h-1 rounded-full bg-border" />
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
