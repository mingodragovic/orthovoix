// src/types/progress.types.ts
export type ProgressType =
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar'
  | 'comprehension'
  | 'fluency'
  | 'articulation'
  | 'phonology'
  | 'language'
  | 'social_communication'
  | 'overall';

export type GoalStatus = 'not-started' | 'in-progress' | 'achieved' | 'abandoned';

export interface AssessmentScores {
  pronunciationScore?: number;
  vocabularyScore?: number;
  grammarScore?: number;
  comprehensionScore?: number;
  fluencyScore?: number;
  articulationScore?: number;
  phonologyScore?: number;
  languageScore?: number;
  socialCommunicationScore?: number;
  overallScore?: number;
}

export interface NextGoal {
  description: string;
  status: GoalStatus;
  targetDate?: string;
  achievedDate?: string;
  notes?: string;
}

export interface ProgressRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordedBy: string;
  recorderName: string;
  recordDate: string;
  type: ProgressType;
  scores: AssessmentScores;
  notes: string;
  strengths: string[];
  areasForImprovement: string[];
  nextGoals: NextGoal[];
  therapyPlanAdjustments: string;
  recommendedFrequency: string;
  therapyDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummaryResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    patientId: string;
    totalRecords: number;
    summary: {
      latestOverallScore: number | null;
      averageOverallScore: number | null;
      averageScores: Record<string, number>;
      totalGoals: number;
      achievedGoals: number;
      goalCompletionRate: number;
    };
    trends: Array<{
      date: string;
      overallScore: number | null;
      type: string;
    }>;
    commonStrengths: string[];
    commonAreasForImprovement: string[];
    goalStatusCount: {
      'not-started': number;
      'in-progress': number;
      'achieved': number;
      'abandoned': number;
    };
  };
}

export interface ProgressChartResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    patientId: string;
    labels: string[];
    datasets: Array<{
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
}

export interface ProgressRecordsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: ProgressRecord[];
}