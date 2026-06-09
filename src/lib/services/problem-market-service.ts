// @ts-nocheck
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getProblemScopeWhere, type ViewerContext } from "@/lib/permissions";
import {
  clampPercentage,
  mapDifficultyLabel,
  mapProblemSourceLabel,
} from "@/lib/services/shared";
import type { ProblemMarketData } from "@/types/aoip";

const problemInclude = {
  createdBy: {
    select: {
      name: true,
    },
  },
  bookmarks: {
    select: {
      userId: true,
    },
  },
  projects: {
    select: {
      id: true,
      domain: true,
      difficulty: true,
    },
  },
} satisfies Prisma.ProblemInclude;

type ProblemRecord = Prisma.ProblemGetPayload<{
  include: typeof problemInclude;
}>;

function deriveTrendingScore(problem: ProblemRecord) {
  const bookmarkScore = problem.bookmarks.length * 12;
  const adoptionScore = problem.projects.length * 10;
  const recommendationBonus = problem.isFacultyRecommended ? 14 : 0;
  const sourceBonus = problem.source === "INDUSTRY" ? 8 : 4;

  return Math.max(
    problem.trendingScore,
    bookmarkScore + adoptionScore + recommendationBonus + sourceBonus,
  );
}

async function getViewerProjectContext(viewer: ViewerContext) {
  const membership = await db.teamMember.findFirst({
    where: {
      userId: viewer.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    relationLoadStrategy: "join",
    include: {
      team: {
        include: {
          project: {
            select: {
              domain: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  return membership?.team.project ?? null;
}

function deriveFitScore(problem: ProblemRecord, viewerProject: Awaited<ReturnType<typeof getViewerProjectContext>>) {
  let score = deriveTrendingScore(problem);

  if (viewerProject?.domain === problem.domain) {
    score += 12;
  }

  if (viewerProject?.difficulty === problem.difficulty) {
    score += 8;
  }

  if (problem.isFacultyRecommended) {
    score += 6;
  }

  return clampPercentage(Math.min(score, 98));
}

export async function getProblemMarketData(
  viewer: ViewerContext,
): Promise<ProblemMarketData> {
  const [viewerProject, problems, membership] = await Promise.all([
    getViewerProjectContext(viewer),
    db.problem.findMany({
      where: getProblemScopeWhere(),
      orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
      relationLoadStrategy: "join",
      include: problemInclude,
    }),
    db.teamMember.findFirst({
      where: { userId: viewer.userId },
    }),
  ]);

  const mappedProblems = problems
    .map((problem) => {
      const saved = problem.bookmarks.some(
        (bookmark) => bookmark.userId === viewer.userId,
      );
      const fitScore = deriveFitScore(problem, viewerProject);
      const sourceLabel = mapProblemSourceLabel(problem.source);
      const bookmarkCount = problem.bookmarks.length;

      return {
        id: problem.id,
        title: problem.title,
        domain: problem.domain,
        category: problem.category,
        difficulty: mapDifficultyLabel(problem.difficulty),
        source: sourceLabel,
        fitScore,
        trend:
          bookmarkCount > 0
            ? `${bookmarkCount} save${bookmarkCount === 1 ? "" : "s"} this cycle`
            : "Fresh discovery lane",
        summary: problem.summary,
        tags: [
          problem.category,
          problem.domain,
          `${mapDifficultyLabel(problem.difficulty)} scope`,
        ],
        recommendedBy:
          problem.createdBy?.name ??
          (sourceLabel === "Industry"
            ? "Industry collaboration desk"
            : "Faculty innovation council"),
        saved,
      };
    })
    .sort((left, right) => right.fitScore - left.fitScore);

  const recommendedCount = mappedProblems.filter((problem) => problem.fitScore >= 85).length;
  const savedCount = mappedProblems.filter((problem) => problem.saved).length;
  const industryCount = mappedProblems.filter(
    (problem) => problem.source === "Industry",
  ).length;

  return {
    stats: [
      {
        label: "Open briefs",
        value: `${mappedProblems.length}`,
        detail: "Live discovery opportunities in the operating library",
      },
      {
        label: "Recommended",
        value: `${recommendedCount}`,
        detail: "High-fit briefs aligned with current project execution context",
        tone: recommendedCount > 0 ? "positive" : "neutral",
      },
      {
        label: "Industry-backed",
        value: `${industryCount}`,
        detail: "External operating problems suitable for startup-style delivery",
      },
      {
        label: "Saved",
        value: `${savedCount}`,
        detail: "Bookmarks already retained inside the current workspace",
      },
    ],
    categories: [
      "All",
      ...Array.from(new Set(mappedProblems.flatMap((problem) => [problem.category as string, problem.domain as string]))),
    ] as string[],
    trending: mappedProblems.slice(0, 3).map((problem) => ({
      id: problem.id,
      title: problem.title,
      momentum: `${problem.fitScore} fit score · ${problem.trend.toLowerCase()}`,
    })),
    problems: mappedProblems,
    hasProject: viewerProject !== null,
    isTeamLead: membership ? membership.role === "TEAM_LEAD" : true,
  };
}

export async function toggleProblemBookmark(
  viewer: ViewerContext,
  problemId: string,
) {
  const existingBookmark = await db.problemBookmark.findUnique({
    where: {
      problemId_userId: {
        problemId,
        userId: viewer.userId,
      },
    },
  });

  if (existingBookmark) {
    await db.problemBookmark.delete({
      where: {
        id: existingBookmark.id,
      },
    });
  } else {
    await db.problemBookmark.create({
      data: {
        problemId,
        userId: viewer.userId,
      },
    });
  }

  const problem = await db.problem.findUnique({
    where: {
      id: problemId,
    },
    include: {
      bookmarks: {
        select: {
          id: true,
        },
      },
    },
  });

  if (problem) {
    await db.problem.update({
      where: {
        id: problemId,
      },
      data: {
        trendingScore:
          problem.bookmarks.length * 12 + (problem.isFacultyRecommended ? 14 : 0),
      },
    });
  }

  return {
    bookmarked: !existingBookmark,
  };
}
