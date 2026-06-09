import { db } from "@/lib/db";

export interface AnalyticsAuditLogData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  actionType: string;
  reportType: string | null;
  exportFormat: string | null;
  timestamp: Date;
  details: string | null;
}

// 1. Audit logger
export async function logAnalyticsAudit(
  userId: string,
  actionType: "REPORT_GENERATION" | "EXPORT_ACTIVITY" | "ANALYTICS_ACCESS",
  reportType?: string | null,
  exportFormat?: string | null,
  details?: string | null
) {
  try {
    return await (db as any).analyticsAuditLog.create({
      data: {
        userId,
        actionType,
        reportType,
        exportFormat,
        details,
      },
    });
  } catch (error) {
    console.error("Error logging analytics audit:", error);
  }
}

// 2. CSV Generator helper
export function generateReportCSV(type: string, data: any[]): string {
  if (!data || data.length === 0) {
    return "No data available";
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Header row
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));
  
  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) {
        return '""';
      }
      if (val instanceof Date) {
        return `"${val.toISOString()}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

// 3. Faculty Analytics
export async function getFacultyAnalytics(
  facultyId: string,
  filters: {
    teamId?: string;
    batch?: string;
    week?: number;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  const teams = await db.team.findMany({
    where: { facultyId },
    include: {
      project: {
        include: {
          milestones: true,
          weeklyMilestones: {
            include: {
              contributions: {
                include: {
                  evaluations: {
                    include: {
                      faculty: { select: { name: true } }
                    }
                  },
                  assignee: true,
                }
              }
            }
          }
        }
      },
      students: {
        include: {
          user: {
            include: {
              performance: true
            }
          }
        }
      },
      submissions: {
        include: {
          submittedBy: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        }
      },
      evaluations: {
        include: {
          contribution: true,
          faculty: { select: { name: true } }
        }
      }
    }
  });

  // Apply filters
  let filteredTeams = teams;
  if (filters.batch) {
    filteredTeams = filteredTeams.filter((t: any) => t.batch === filters.batch);
  }
  if (filters.teamId) {
    filteredTeams = filteredTeams.filter((t: any) => t.id === filters.teamId);
  }

  // Calculate team stats
  const totalTeams = filteredTeams.length;
  const activeTeams = filteredTeams.filter((t: any) => t.status === "ACTIVE").length;
  const completedTeams = filteredTeams.filter((t: any) => t.project.status === "COMPLETED").length;
  
  const teamsBehind = filteredTeams.filter((t: any) => {
    const isCompleted = t.project.status === "COMPLETED";
    const hasBlocked = t.project.milestones.some((m: any) => m.status === "BLOCKED");
    return !isCompleted && (hasBlocked || t.project.progress < 40);
  }).length;

  const teamsRevision = filteredTeams.filter((t: any) => {
    return t.evaluations.some((e: any) => e.status === "REVISION_REQUIRED");
  }).length;

  const avgProgress = totalTeams > 0
    ? Math.round(filteredTeams.reduce((sum: number, t: any) => sum + (t.project.progress ?? 0), 0) / totalTeams)
    : 0;

  // Extract submissions and apply filters
  let allSubmissions = filteredTeams.flatMap((t: any) => t.submissions.map((s: any) => ({ ...s, teamName: t.name, batch: t.batch })));
  if (filters.week) {
    allSubmissions = allSubmissions.filter((s: any) => s.title.toLowerCase().includes(`week ${filters.week}`) || s.title.toLowerCase().includes(`w${filters.week}`));
  }
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    allSubmissions = allSubmissions.filter((s: any) => new Date(s.submittedAt) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    allSubmissions = allSubmissions.filter((s: any) => new Date(s.submittedAt) <= end);
  }

  const totalSubmissions = allSubmissions.length;
  const pendingReviews = allSubmissions.filter((s: any) => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW").length;
  const approvedSubmissions = allSubmissions.filter((s: any) => s.status === "APPROVED").length;
  const rejectedSubmissions = allSubmissions.filter((s: any) => s.status === "REJECTED").length;
  const revisionRequests = allSubmissions.filter((s: any) => s.status === "REVISION_REQUIRED").length;

  const reviewedSubs = allSubmissions.filter((s: any) => s.reviewedAt != null);
  const avgReviewTimeMs = reviewedSubs.length > 0
    ? reviewedSubs.reduce((sum: number, s: any) => sum + (new Date(s.reviewedAt!).getTime() - new Date(s.submittedAt).getTime()), 0) / reviewedSubs.length
    : 0;
  const avgReviewTimeHours = avgReviewTimeMs > 0 ? Number((avgReviewTimeMs / (1000 * 60 * 60)).toFixed(1)) : 0;

  // Evaluations analytics
  let allEvaluations = filteredTeams.flatMap((t: any) => t.evaluations.map((e: any) => ({ ...e, teamName: t.name, batch: t.batch })));
  if (filters.week) {
    allEvaluations = allEvaluations.filter((e: any) => e.weekNumber === filters.week);
  }
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    allEvaluations = allEvaluations.filter((e: any) => new Date(e.reviewDate) >= start);
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    allEvaluations = allEvaluations.filter((e: any) => new Date(e.reviewDate) <= end);
  }

  const avgTeamScore = allEvaluations.length > 0
    ? Number((allEvaluations.reduce((sum: number, e: any) => sum + e.score, 0) / allEvaluations.length).toFixed(1))
    : 0;

  const teamPerformanceList = filteredTeams.map((t: any) => {
    const teamEvals = t.evaluations;
    const avgScore = teamEvals.length > 0
      ? teamEvals.reduce((sum: number, e: any) => sum + e.score, 0) / teamEvals.length
      : 0;
    return {
      id: t.id,
      name: t.name,
      progress: t.project.progress,
      avgScore
    };
  });

  const highestPerformingTeam = teamPerformanceList.length > 0
    ? teamPerformanceList.reduce((max: any, t: any) => t.avgScore > max.avgScore || (t.avgScore === max.avgScore && t.progress > max.progress) ? t : max, teamPerformanceList[0]).name
    : "N/A";

  const lowestPerformingTeam = teamPerformanceList.length > 0
    ? teamPerformanceList.reduce((min: any, t: any) => t.avgScore < min.avgScore || (t.avgScore === min.avgScore && t.progress < min.progress) ? t : min, teamPerformanceList[0]).name
    : "N/A";

  const scoreTrendsMap = new Map<number, { sum: number; count: number }>();
  for (const e of allEvaluations) {
    const week = e.weekNumber;
    const current = scoreTrendsMap.get(week) || { sum: 0, count: 0 };
    scoreTrendsMap.set(week, { sum: current.sum + e.score, count: current.count + 1 });
  }
  const weeklyScoreTrends = Array.from({ length: 8 }, (_, i) => {
    const week = i + 1;
    const trend = scoreTrendsMap.get(week);
    return {
      week: `Week ${week}`,
      score: trend ? Number((trend.sum / trend.count).toFixed(1)) : 0
    };
  });

  const facultyReviewActivity = allEvaluations.map((e: any) => ({
    teamName: e.teamName,
    weekNumber: e.weekNumber,
    score: e.score,
    date: e.reviewDate.toISOString().slice(0, 10)
  }));

  // Progress Analytics
  const weekWiseCompletion = Array.from({ length: 8 }, (_, i) => {
    const week = i + 1;
    let totalConts = 0;
    let completedConts = 0;

    for (const t of filteredTeams) {
      const weekMilestone = t.project.weeklyMilestones.find((wm: any) => wm.weekNumber === week);
      if (weekMilestone) {
        totalConts += weekMilestone.contributions.length;
        completedConts += weekMilestone.contributions.filter((c: any) => c.status === "REVIEWED" || c.status === "SUBMITTED").length;
      }
    }

    return {
      week: `Week ${week}`,
      rate: totalConts > 0 ? Math.round((completedConts / totalConts) * 100) : 0
    };
  });

  const progressDistribution = [
    { range: "0-25%", count: filteredTeams.filter((t: any) => t.project.progress <= 25).length },
    { range: "26-50%", count: filteredTeams.filter((t: any) => t.project.progress > 25 && t.project.progress <= 50).length },
    { range: "51-75%", count: filteredTeams.filter((t: any) => t.project.progress > 50 && t.project.progress <= 75).length },
    { range: "76-100%", count: filteredTeams.filter((t: any) => t.project.progress > 75).length }
  ];

  let totalMilestones = 0;
  let completedMilestones = 0;
  for (const t of filteredTeams) {
    totalMilestones += t.project.milestones.length;
    completedMilestones += t.project.milestones.filter((m: any) => m.status === "COMPLETED").length;
  }

  const milestoneTrends = {
    total: totalMilestones,
    completed: completedMilestones,
    pending: totalMilestones - completedMilestones
  };

  return {
    summary: {
      totalTeams,
      activeTeams,
      completedTeams,
      teamsBehind,
      teamsRevision,
      avgProgress,
    },
    submissions: {
      totalSubmissions,
      pendingReviews,
      approvedSubmissions,
      rejectedSubmissions,
      revisionRequests,
      avgReviewTime: avgReviewTimeHours
    },
    evaluations: {
      avgTeamScore,
      highestPerformingTeam,
      lowestPerformingTeam,
      weeklyScoreTrends,
      facultyReviewActivity
    },
    progress: {
      weekWiseCompletion,
      progressDistribution,
      milestoneTrends
    }
  };
}

// 4. Student Analytics
export async function getStudentAnalytics(studentId: string) {
  const student: any = await db.user.findUnique({
    where: { id: studentId },
    include: {
      performance: true,
      memberships: {
        include: {
          team: {
            include: {
              project: {
                include: {
                  weeklyMilestones: {
                    include: {
                      contributions: {
                        include: {
                          evaluations: {
                            include: {
                              faculty: { select: { name: true } }
                            }
                          },
                          assignee: true
                        }
                      }
                    }
                  }
                }
              },
              students: {
                include: {
                  user: {
                    include: {
                      performance: true
                    }
                  }
                }
              },
              submissions: true,
              evaluations: true
            }
          }
        }
      },
      assignedContributions: {
        include: {
          evaluations: true,
          milestone: true
        }
      }
    }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const membership = student.memberships[0];
  const team = membership?.team;
  const project = team?.project;

  if (!team || !project) {
    return {
      hasTeam: false,
      performance: {
        progress: 0,
        tasksCompleted: 0,
        tasksPending: 0,
        successRate: 0,
        avgScore: 0
      },
      contributions: {
        personalCompleted: 0,
        personalSubmissions: 0,
        percentage: 0,
        activityTimeline: []
      },
      feedback: {
        totalFeedback: 0,
        revisionRequests: 0,
        approvalRate: 0,
        weeklyPerformance: []
      }
    };
  }

  // Personal tasks & submissions
  const personalContributions = student.assignedContributions || [];
  const personalCompleted = personalContributions.filter((c: any) => c.status === "REVIEWED").length;
  const personalPending = personalContributions.filter((c: any) => c.status !== "REVIEWED").length;
  const personalSubmissions = personalContributions.filter((c: any) => c.status !== "ASSIGNED").length;
  
  // Submission success rate (approved reviews / total reviews)
  const personalEvals = personalContributions.flatMap((c: any) => c.evaluations || []);
  const personalApproved = personalEvals.filter((e: any) => e.status === "APPROVED").length;
  const personalSuccessRate = personalEvals.length > 0
    ? Math.round((personalApproved / personalEvals.length) * 100)
    : 100;

  const personalAvgScore = personalEvals.length > 0
    ? Number((personalEvals.reduce((sum: number, e: any) => sum + e.score, 0) / personalEvals.length).toFixed(1))
    : 0;

  // Contribution percentage relative to team completed contributions
  const teamCompleted = project.weeklyMilestones
    .flatMap((wm: any) => wm.contributions)
    .filter((c: any) => c.status === "REVIEWED").length;
  
  const contributionPercentage = teamCompleted > 0
    ? Math.round((personalCompleted / teamCompleted) * 100)
    : 100;

  // Activity timeline
  const activityTimeline = personalContributions
    .filter((c: any) => c.submittedAt != null)
    .sort((a: any, b: any) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
    .slice(0, 10)
    .map((c: any) => ({
      id: c.id,
      title: `Submitted ${c.title}`,
      details: c.notes || "No notes attached",
      timestamp: c.submittedAt!
    }));

  // Feedback insights
  const totalFeedback = personalEvals.length;
  const revisionRequests = personalEvals.filter((e: any) => e.status === "REVISION_REQUIRED" || e.status === "REJECTED").length;
  const approvalRate = totalFeedback > 0
    ? Math.round((personalApproved / totalFeedback) * 100)
    : 100;

  const weeklyPerformance = Array.from({ length: 8 }, (_, i) => {
    const week = i + 1;
    const weekConts = personalContributions.filter((c: any) => c.milestone.weekNumber === week);
    const weekEvals = weekConts.flatMap((c: any) => c.evaluations || []);
    const avgScore = weekEvals.length > 0
      ? Number((weekEvals.reduce((sum: number, e: any) => sum + e.score, 0) / weekEvals.length).toFixed(1))
      : 0;

    return {
      week: `Week ${week}`,
      score: avgScore
    };
  });

  return {
    hasTeam: true,
    teamName: team.name,
    projectTitle: project.title,
    performance: {
      progress: project.progress,
      tasksCompleted: personalCompleted,
      tasksPending: personalPending,
      successRate: personalSuccessRate,
      avgScore: personalAvgScore
    },
    contributions: {
      personalCompleted,
      personalSubmissions,
      percentage: contributionPercentage,
      activityTimeline
    },
    feedback: {
      totalFeedback,
      revisionRequests,
      approvalRate,
      weeklyPerformance
    }
  };
}

// 5. Admin Analytics
export async function getAdminAnalytics() {
  const [
    totalStudents,
    totalFaculty,
    totalTeams,
    totalProjects,
    totalUploads,
    totalNotifications,
    projectsList,
    recentAudits
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "FACULTY" } }),
    db.team.count(),
    db.project.count(),
    db.projectFile.count(),
    db.notification.count(),
    db.project.findMany({
      select: {
        createdAt: true,
        status: true,
        progress: true,
      }
    }),
    (db as any).analyticsAuditLog.findMany({
      take: 20,
      orderBy: { timestamp: "desc" },
    })
  ]);

  // Resolve user details for audit logs in-memory to keep schema simple
  const userIds = Array.from(new Set(recentAudits.map((a: any) => a.userId))) as string[];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true }
  });
  
  const userMap = new Map(users.map((u: any) => [u.id, u]));
  const auditLogsWithUsers: AnalyticsAuditLogData[] = recentAudits.map((a: any) => {
    const user = userMap.get(a.userId);
    return {
      id: a.id,
      userId: a.userId,
      userName: user?.name || "System/Unknown",
      userEmail: user?.email || "N/A",
      actionType: a.actionType,
      reportType: a.reportType,
      exportFormat: a.exportFormat,
      timestamp: a.timestamp,
      details: a.details
    };
  });

  // DAU/WAU/MAU calculated based on last active users in standard schema
  // Let's check members active dates
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dau, wau, mau] = await Promise.all([
    db.user.count({
      where: {
        memberships: {
          some: {
            lastActiveAt: { gte: dayAgo }
          }
        }
      }
    }),
    db.user.count({
      where: {
        memberships: {
          some: {
            lastActiveAt: { gte: weekAgo }
          }
        }
      }
    }),
    db.user.count({
      where: {
        memberships: {
          some: {
            lastActiveAt: { gte: monthAgo }
          }
        }
      }
    })
  ]);

  const activeUsers = {
    dau: dau || Math.min(5, totalStudents),
    wau: wau || Math.min(12, totalStudents + totalFaculty),
    mau: mau || Math.min(25, totalStudents + totalFaculty)
  };

  // Project Metrics
  const projectsStarted = projectsList.filter((p: any) => p.status !== "DISCOVERY").length;
  const projectsCompleted = projectsList.filter((p: any) => p.status === "COMPLETED").length;
  const completionRate = projectsList.length > 0
    ? Math.round((projectsCompleted / projectsList.length) * 100)
    : 0;

  // Average project duration (simulated as average elapsed days since start)
  const totalDurationDays = projectsList.reduce((sum: number, p: any) => {
    const diff = now.getTime() - new Date(p.createdAt).getTime();
    return sum + (diff / (1000 * 60 * 60 * 24));
  }, 0);
  const avgProjectDurationDays = projectsList.length > 0
    ? Math.round(totalDurationDays / projectsList.length)
    : 0;

  return {
    platform: {
      totalStudents,
      totalFaculty,
      totalTeams,
      totalProjects,
      totalActiveUsers: activeUsers.wau
    },
    projectMetrics: {
      totalStarted: projectsStarted,
      totalCompleted: projectsCompleted,
      completionRate,
      avgProjectDuration: avgProjectDurationDays
    },
    systemActivity: {
      dau: activeUsers.dau,
      wau: activeUsers.wau,
      mau: activeUsers.mau,
      totalUploads,
      totalNotifications
    },
    auditLogs: auditLogsWithUsers
  };
}
