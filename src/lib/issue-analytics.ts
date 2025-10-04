import { GitHubIssue } from './github-api';
import { supabase } from '@/integrations/supabase/client';

export interface IssueAnalysis {
  completionProbability: number;
  estimatedDays: number;
  isUserActive: boolean;
  risk: 'low' | 'medium' | 'high';
  reasoning: string;
  recommendation: string;
}

export async function analyzeIssue(
  issue: GitHubIssue,
  assigneeActivity: any,
  repoStats: any
): Promise<IssueAnalysis> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-issue', {
      body: {
        issue,
        assigneeActivity,
        repoStats
      }
    });

    if (error) throw error;
    return data as IssueAnalysis;
  } catch (error) {
    console.error('Error analyzing issue:', error);
    // Return fallback analysis
    return {
      completionProbability: 50,
      estimatedDays: 7,
      isUserActive: false,
      risk: 'medium',
      reasoning: 'Unable to analyze - using default estimates',
      recommendation: 'Monitor this issue for activity'
    };
  }
}

export function getActivityStatus(lastUpdate: string): 'active' | 'away' | 'offline' {
  const daysSince = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSince < 1) return 'active';
  if (daysSince < 7) return 'away';
  return 'offline';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low': return 'text-success';
    case 'medium': return 'text-warning';
    case 'high': return 'text-destructive';
  }
}
