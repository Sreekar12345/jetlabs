/**
 * Roadmap and milestone types.
 * Used for the weekly execution plan tracking.
 */

export type MilestoneState = "done" | "current" | "todo";

export type Milestone = {
  week: number;
  label: string;
  state: MilestoneState;
  description?: string;
  deliverables?: string[];
};

export type Roadmap = {
  id: string;
  projectId: string;
  title: string;
  totalWeeks: number;
  currentWeek: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
};

export type RoadmapProgress = {
  roadmapId: string;
  completedMilestones: number;
  totalMilestones: number;
  percentComplete: number;
  isOnTrack: boolean;
};
