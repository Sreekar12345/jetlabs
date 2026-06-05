"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ShieldCheck,
  Crown,
  BookOpenCheck,
  Zap,
  Users2,
  Medal,
  Star,
  Plus,
  Download,
  Share2,
  FileDown,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createAchievementAction } from "@/lib/actions/review-actions";

type Achievement = {
  id: string;
  title: string;
  description: string;
  badge: string;
  points: number;
  createdAt: string;
};

function categoryStyles(badge: string) {
  if (badge === "Research") {
    return {
      card: "border-indigo-200 bg-[linear-gradient(135deg,#ffffff_0%,#faf7ff_54%,#eef2ff_100%)]",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
      icon: BookOpenCheck,
      iconClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
    };
  }

  if (badge === "Hackathon") {
    return {
      card: "border-cyan-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdff_45%,#ecfeff_100%)]",
      chip: "border-cyan-200 bg-cyan-50 text-cyan-700",
      icon: Zap,
      iconClass: "border-cyan-200 bg-cyan-50 text-cyan-700",
    };
  }

  if (badge === "Sports") {
    return {
      card: "border-red-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f7_55%,#fee2e2_100%)]",
      chip: "border-red-200 bg-red-50 text-red-700",
      icon: Medal,
      iconClass: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (badge === "Execution") {
    return {
      card: "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdf4_45%,#dcfce7_100%)]",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: Trophy,
      iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    card: "border-blue-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_52%,#dbeafe_100%)]",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Star,
    iconClass: "border-blue-200 bg-blue-50 text-blue-700",
  };
}

export function AchievementsClient({
  achievements,
  user,
}: {
  achievements: Achievement[];
  user: { name: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badgeType, setBadgeType] = useState("Execution");
  const [points, setPoints] = useState("50");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const totalPoints = achievements.reduce((sum, item) => sum + item.points, 0);

  // Compute reputation level
  let reputationLevel = "Beginner";
  if (totalPoints > 300) reputationLevel = "Elite";
  else if (totalPoints > 150) reputationLevel = "Advanced";
  else if (totalPoints > 50) reputationLevel = "Intermediate";

  // Derive metrics
  const researchCount = achievements.filter(a => a.badge === "Research").length;
  const hackathonCount = achievements.filter(a => a.badge === "Hackathon").length;
  const executionCount = achievements.filter(a => a.badge === "Execution").length;

  const metrics = [
    { label: "Total achievements", value: achievements.length.toString(), detail: "overall logged", icon: Trophy, className: "border-amber-200 bg-amber-50 text-amber-700" },
    { label: "Credibility Points", value: totalPoints.toString(), detail: "cumulative index", icon: ShieldCheck, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    { label: "Reputation Level", value: reputationLevel, detail: "profile tier", icon: Crown, className: "border-purple-200 bg-purple-50 text-purple-700" },
    { label: "Research Track", value: researchCount.toString(), detail: "papers & reviews", icon: BookOpenCheck, className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
    { label: "Hackathons Logged", value: hackathonCount.toString(), detail: "competitive wins", icon: Zap, className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
    { label: "Execution Benchmarks", value: executionCount.toString(), detail: "project delivery", icon: Trophy, className: "border-slate-200 bg-slate-50 text-slate-700" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim() || !description.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    startTransition(async () => {
      const res = await createAchievementAction({
        title: title.trim(),
        description: description.trim(),
        badge: badgeType,
        points: parseInt(points, 10) || 50,
      });

      if (!res.success) {
        setErrorMsg(res.message || "An error occurred.");
      } else {
        setSuccessMsg("Achievement successfully recorded in your profile portfolio.");
        setTitle("");
        setDescription("");
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <section className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <Trophy className="size-7" />
          </span>
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight">Achievement Portfolio</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Verified proof of academic, technical, research, and competitive accomplishments for {user.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsOpen(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="size-4 mr-1" />
            Add Achievement
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="group overflow-hidden transition hover:border-slate-300">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className={cn("grid size-11 place-items-center rounded-xl border", metric.className)}>
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Live
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{metric.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Achievement Form Drawer/Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-border bg-card shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-xl">Record Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs border border-destructive/20 bg-destructive/10 text-red-500 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Title</label>
                  <Input
                    className="rounded-xl"
                    placeholder="e.g. Smart India Hackathon Winner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Description</label>
                  <Textarea
                    className="rounded-xl text-sm"
                    placeholder="Explain the role, project, outcome, and tools used..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Category Badge</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm"
                      value={badgeType}
                      onChange={(e) => setBadgeType(e.target.value)}
                    >
                      <option value="Execution">Execution</option>
                      <option value="Research">Research</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Sports">Sports</option>
                      <option value="General">General Badge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Credibility Points</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                    >
                      <option value="50">50 Points (Normal)</option>
                      <option value="100">100 Points (Major)</option>
                      <option value="200">200 Points (Elite)</option>
                      <option value="500">500 Points (National Win)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isPending ? "Saving..." : "Save Achievement"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dynamic list and timeline of achievements */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-bold">Verified Milestones & Outcomes</h2>
            <Badge variant="outline" className="bg-background">
              {achievements.length} records
            </Badge>
          </div>

          {achievements.length === 0 ? (
            <Card className="border-dashed border-border p-12 text-center text-muted-foreground text-sm">
              You haven't logged any achievements yet. Click &quot;Add Achievement&quot; above to log your accomplishments.
            </Card>
          ) : (
            achievements.map((item) => {
              const styles = categoryStyles(item.badge);
              const Icon = styles.icon;
              return (
                <article
                  key={item.id}
                  className={cn(
                    "group rounded-3xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                    styles.card
                  )}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex gap-4">
                      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl border", styles.iconClass)}>
                        <Icon className="size-6" />
                      </span>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={styles.chip}>{item.badge}</Badge>
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            Verified
                          </Badge>
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-white/80 bg-white/75 px-4 py-2.5 text-right shadow-sm self-start">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Points
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        +{item.points}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Logged on {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-foreground">Credibility Signal Verified</span>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Reputation system explanation and quick details */}
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reputation Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Researcher", cond: "Log at least 1 Research output", ok: researchCount >= 1, icon: BookOpenCheck },
                { name: "Hackathon Champion", cond: "Log a competitive Hackathon milestone", ok: hackathonCount >= 1, icon: Zap },
                { name: "System Builder", cond: "Log at least 1 Execution benchmark", ok: executionCount >= 1, icon: Trophy },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.name}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border transition",
                      badge.ok
                        ? "border-indigo-100 bg-indigo-50/50 text-indigo-900"
                        : "border-border bg-muted/20 opacity-60"
                    )}
                  >
                    <span className="grid size-9 place-items-center rounded-xl bg-white border">
                      <Icon className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs">{badge.name}</h4>
                      <p className="text-[10px] text-muted-foreground leading-normal">{badge.cond}</p>
                    </div>
                    <Badge className={badge.ok ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}>
                      {badge.ok ? "Active" : "Locked"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
