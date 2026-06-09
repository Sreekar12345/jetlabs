import { db } from "@/lib/db";

const DEFAULT_WEEKLY_ROADMAP = [
  {
    week: 1,
    title: "Problem Understanding & Research",
    desc: "Gain a deep understanding of the problem statement, identify core constraints, and perform initial research on technologies.",
  },
  {
    week: 2,
    title: "Literature Survey & Analysis",
    desc: "Perform a literature review of existing solutions, carry out a feasibility study, and define project benchmarks.",
  },
  {
    week: 3,
    title: "Requirements Gathering",
    desc: "Specify functional and non-functional requirements, compile the Software Requirements Specification (SRS).",
  },
  {
    week: 4,
    title: "System Design",
    desc: "Design the high-level system architecture, ER diagrams, database schemas, UI wireframes, and API contracts.",
  },
  {
    week: 5,
    title: "Development Phase 1",
    desc: "Set up the code repository and dev environment, implement authentication, and construct base system templates.",
  },
  {
    week: 6,
    title: "Development Phase 2",
    desc: "Build intermediate core features, integrate UI elements with backend APIs, and configure database connection logic.",
  },
  {
    week: 7,
    title: "Testing & Validation",
    desc: "Develop and run unit/integration tests, perform User Acceptance Testing (UAT), and debug performance issues.",
  },
  {
    week: 8,
    title: "Documentation & Final Submission",
    desc: "Compile final project documentation, write user manuals, package the source files, and prepare presentation slides.",
  },
];

const WEEKLY_TASK_TEMPLATES: Record<number, string[]> = {
  1: [
    "Research existing solutions and state-of-the-art methods",
    "Analyze project scope, objectives, and key constraints",
    "Collect reference papers, documentation, and external resources",
    "Prepare a comprehensive problem research summary"
  ],
  2: [
    "Draft literature survey document based on prior work",
    "Conduct comparative analysis of similar applications",
    "Outline project feasibility study and technical challenges",
    "Evaluate chosen algorithms, frameworks, or libraries"
  ],
  3: [
    "Define functional requirements and user stories",
    "Specify non-functional requirements (performance, security)",
    "Create Software Requirements Specification (SRS) document",
    "Map requirements to project phases and milestones"
  ],
  4: [
    "Design system architecture and high-level data flows",
    "Create Entity-Relationship (ER) diagram and database schema",
    "Wireframe user interface layouts and core user flows",
    "Specify API endpoints, contracts, and data structures"
  ],
  5: [
    "Set up dev environment and code repository boilerplate",
    "Configure database connections and data models",
    "Implement base UI layout components and stylesheets",
    "Build initial REST API endpoints and router structure"
  ],
  6: [
    "Build core features and business logic handlers",
    "Integrate frontend views with backend endpoints",
    "Implement error handling, logging, and validations",
    "Set up third-party services, APIs, and libraries"
  ],
  7: [
    "Write unit and integration tests for key modules",
    "Conduct security scanning and vulnerability tests",
    "Perform manual testing and record user acceptance flows",
    "Optimize database queries and patch code bugs"
  ],
  8: [
    "Finalize project documentation and project report",
    "Draft user manuals and installation instructions",
    "Package deliverables and prepare hosting environments",
    "Create final presentation slides and software demo video"
  ]
};

/**
 * Initializes the 8 default weekly milestones for a newly created or linked project.
 * Automatically generates and distributes tasks for all members.
 */
export async function initializeProjectWeeklyMilestones(
  projectId: string,
  tx: any = db,
  projectCreatedAt: Date = new Date()
) {
  // Check if milestones already exist to avoid duplicate seeding
  const existingCount = await tx.weeklyMilestone.count({
    where: { projectId },
  });

  if (existingCount > 0) {
    return;
  }

  // Fetch team and students
  const project = await tx.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          students: true,
        },
      },
    },
  });

  const students = project?.team?.students ?? [];
  const leadMember = students.find((s: any) => s.role === "TEAM_LEAD") || students[0];
  const leadUserId = leadMember ? leadMember.userId : "";

  for (const item of DEFAULT_WEEKLY_ROADMAP) {
    const start = new Date(projectCreatedAt);
    start.setDate(start.getDate() + (item.week - 1) * 7);
    const due = new Date(projectCreatedAt);
    due.setDate(due.getDate() + item.week * 7);

    const milestone = await tx.weeklyMilestone.create({
      data: {
        projectId,
        weekNumber: item.week,
        title: item.title,
        description: item.desc,
        startDate: start,
        dueDate: due,
        status: item.week === 1 ? "IN_PROGRESS" : "NOT_STARTED",
      },
    });

    // Automatically generate and distribute tasks for students
    if (students.length > 0) {
      const templates = WEEKLY_TASK_TEMPLATES[item.week] || [];
      for (let j = 0; j < students.length; j++) {
        const student = students[j];
        const taskTitle = templates[j % templates.length] || "Complete weekly progress deliverables";

        const contribution = await tx.contribution.create({
          data: {
            milestoneId: milestone.id,
            assignedTo: student.userId,
            assignedBy: leadUserId || student.userId,
            title: taskTitle,
            description: `Automated task assignment for Week ${item.week} - ${item.title}.`,
            status: "ASSIGNED",
          },
        });

        // Trigger Notification
        await tx.notification.create({
          data: {
            userId: student.userId,
            userRole: "STUDENT",
            title: "Task Assigned",
            message: `You have been assigned task: "${taskTitle}" for Week ${item.week}.`,
            type: "TASK_ASSIGNED",
            relatedEntityId: contribution.id,
            triggerEvent: "WEEKLY_TASKS_GENERATED",
          },
        });
      }
    }
  }
}

/**
 * Automatically checks for any students who do not have contributions/tasks
 * generated in the weekly milestones and generates/distributes tasks for them.
 */
export async function ensureContributionsGenerated(projectId: string, tx: any = db) {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          students: true,
        },
      },
      weeklyMilestones: {
        include: {
          contributions: true,
        },
      },
    },
  });

  if (!project || !project.team) return;

  const students = project.team.students;
  if (students.length === 0) return;

  const leadMember = students.find((s: any) => s.role === "TEAM_LEAD") || students[0];
  const leadUserId = leadMember ? leadMember.userId : "";

  for (const milestone of project.weeklyMilestones) {
    const existingAssignees = new Set(milestone.contributions.map((c: any) => c.assignedTo));
    const missingStudents = students.filter((s: any) => !existingAssignees.has(s.userId));

    if (missingStudents.length > 0) {
      const templates = WEEKLY_TASK_TEMPLATES[milestone.weekNumber] || [];
      let indexOffset = milestone.contributions.length;

      for (const student of missingStudents) {
        const taskTitle = templates[indexOffset % templates.length] || "Complete weekly progress deliverables";
        indexOffset++;

        const contribution = await tx.contribution.create({
          data: {
            milestoneId: milestone.id,
            assignedTo: student.userId,
            assignedBy: leadUserId || student.userId,
            title: taskTitle,
            description: `Automated task assignment for Week ${milestone.weekNumber} - ${milestone.title}.`,
            status: "ASSIGNED",
          },
        });

        // Trigger Notification
        await tx.notification.create({
          data: {
            userId: student.userId,
            userRole: "STUDENT",
            title: "Task Assigned",
            message: `You have been assigned task: "${taskTitle}" for Week ${milestone.weekNumber}.`,
            type: "TASK_ASSIGNED",
            relatedEntityId: contribution.id,
            triggerEvent: "TASK_ASSIGNED",
          },
        });
      }
    }
  }
}

/**
 * Retrieves the weekly milestones of a project. If none exist, initializes them first.
 * If milestones exist but new members joined, automatically populates missing contributions.
 */
export async function getOrCreateWeeklyMilestones(
  projectId: string,
  projectCreatedAt: Date = new Date()
) {
  let milestones = await db.weeklyMilestone.findMany({
    where: { projectId },
    orderBy: { weekNumber: "asc" },
    include: {
      contributions: {
        include: {
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          assigner: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (milestones.length === 0) {
    await initializeProjectWeeklyMilestones(projectId, db, projectCreatedAt);
  } else {
    // Check if new members have joined the team and need contributions assigned
    await ensureContributionsGenerated(projectId, db);
  }

  // Refetch to include newly generated contributions
  milestones = await db.weeklyMilestone.findMany({
    where: { projectId },
    orderBy: { weekNumber: "asc" },
    include: {
      contributions: {
        include: {
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          assigner: { select: { id: true, name: true } },
        },
      },
    },
  });

  return milestones;
}
