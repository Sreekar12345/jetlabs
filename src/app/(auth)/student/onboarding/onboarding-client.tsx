"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Orbit, LoaderCircle, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type OnboardingClientProps = {
  userName: string;
};

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"join" | "request" | "success">("join");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join Form State
  const [teamCode, setTeamCode] = useState("");

  // Request Form State
  const [requestData, setRequestData] = useState({
    collegeName: "",
    department: "",
    section: "",
    facultyName: "",
    notes: "",
  });

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
      setStep("success");
      
      // Delay redirect to show success message
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
      setStep("success");

      // Redirect student after success
      setTimeout(() => {
        router.refresh();
        router.push("/student/dashboard");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  }

  const inputClasses = "h-11 rounded-[8px] border-border bg-muted/60 text-sm focus-visible:bg-white";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 lg:p-10">
      <AnimatePresence mode="wait">
        {step === "join" && (
          <motion.div
            key="join"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="border-border/80 bg-card/95 backdrop-blur shadow-lg">
              <CardHeader className="space-y-4 border-b border-border/80 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
                    <Orbit className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-foreground">
                      JetLabs
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Classroom Learning OS
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-balance text-2xl font-bold">Join Your Team</h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Enter the Team Code provided by your Faculty or Mentor.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleJoinSubmit} className="space-y-5">
                  {error && (
                    <div
                      role="alert"
                      className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="teamCode" className="text-sm font-medium text-foreground">
                      Team Code
                    </label>
                    <Input
                      id="teamCode"
                      type="text"
                      className={inputClasses}
                      placeholder="JTL-2026-A12"
                      value={teamCode}
                      onChange={(e) => {
                        setError(null);
                        setTeamCode(e.target.value);
                      }}
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          Verifying Team Code...
                        </>
                      ) : (
                        "Join Team"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      disabled={loading}
                      onClick={() => {
                        setError(null);
                        setStep("request");
                      }}
                    >
                      I Don't Have a Team Code
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "request" && (
          <motion.div
            key="request"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <Card className="border-border/80 bg-card/95 backdrop-blur shadow-lg">
              <CardHeader className="space-y-4 border-b border-border/80 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
                      <Orbit className="size-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        JetLabs
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Classroom Learning OS
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setError(null);
                      setStep("join");
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                </div>

                <div className="space-y-1">
                  <h1 className="text-balance text-2xl font-bold">Request Team Assignment</h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Don't have a code? Fill in your details below and submit an assignment request to your faculty advisor.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {error && (
                    <div
                      role="alert"
                      className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="collegeName" className="text-sm font-medium text-foreground">
                        College Name
                      </label>
                      <Input
                        id="collegeName"
                        type="text"
                        className={inputClasses}
                        placeholder="e.g. Syntra Institute"
                        value={requestData.collegeName}
                        onChange={(e) => {
                          setError(null);
                          setRequestData({ ...requestData, collegeName: e.target.value });
                        }}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="department" className="text-sm font-medium text-foreground">
                        Department
                      </label>
                      <Input
                        id="department"
                        type="text"
                        className={inputClasses}
                        placeholder="e.g. CSE"
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="section" className="text-sm font-medium text-foreground">
                        Section
                      </label>
                      <Input
                        id="section"
                        type="text"
                        className={inputClasses}
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

                    <div className="space-y-1.5">
                      <label htmlFor="facultyName" className="text-sm font-medium text-foreground">
                        Faculty Name
                      </label>
                      <Input
                        id="facultyName"
                        type="text"
                        className={inputClasses}
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

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-foreground">
                      Additional Notes
                    </label>
                    <Textarea
                      id="notes"
                      className="min-h-[80px] rounded-[8px] border-border bg-muted/60 text-sm focus-visible:bg-white"
                      placeholder="Enter any additional details or messages for your advisor..."
                      value={requestData.notes}
                      onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          Submitting Request...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="border-border/80 bg-card/95 backdrop-blur shadow-lg text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-8 animate-bounce" />
                </div>
                
                <h1 className="text-2xl font-bold text-foreground">Success!</h1>
                <p className="text-sm leading-6 text-muted-foreground px-4">
                  You have successfully joined your team.
                </p>
                <p className="text-xs text-muted-foreground animate-pulse">
                  Redirecting to your dashboard...
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
