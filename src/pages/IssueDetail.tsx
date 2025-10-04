import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI } from '@/lib/github-api';
import { Timeline } from '@/components/Timeline';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export default function IssueDetail() {
  const { owner, repo, number } = useParams();

  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['issue', owner, repo, number],
    queryFn: async () => {
      if (!owner || !repo || !number) throw new Error('Invalid params');
      return await githubAPI.getIssue(owner, repo, parseInt(number));
    },
    enabled: !!owner && !!repo && !!number,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['issue-timeline', owner, repo, number],
    queryFn: async () => {
      if (!owner || !repo || !number) throw new Error('Invalid params');
      return await githubAPI.getIssueTimeline(owner, repo, parseInt(number));
    },
    enabled: !!owner && !!repo && !!number,
  });

  if (issueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Issue Not Found</h2>
          <p className="text-muted-foreground mb-6">The issue you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/issues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isStale = githubAPI.isStaleIssue(issue);
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" asChild className="mb-6">
          <Link to={`/issues?repo=${owner}/${repo}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <h1 className="text-3xl font-bold flex-1">{issue.title}</h1>
                <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
                  {issue.state}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="font-mono">#{issue.number}</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Updated {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {isStale && (
              <Card className="p-6 bg-destructive/5 border-destructive/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">⚠️ Stale Issue Detected</h3>
                    <p className="text-muted-foreground">
                      This issue has been assigned to{' '}
                      <span className="font-semibold">{issue.assignee?.login}</span> but shows no
                      recent activity ({daysSinceUpdate} days since last update).
                      {!issue.pull_request && ' No pull request has been linked yet.'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
                  <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <a
                    href={issue.user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {issue.user.login}
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(issue.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {issue.body ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-muted-foreground">{issue.body}</p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </Card>

            {/* Timeline */}
            {timelineLoading ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <Timeline events={timeline || []} />
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button className="w-full gap-2" asChild>
                <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </Card>

            {/* Details */}
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Details</h3>

              {/* Assignee */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span>Assignee</span>
                </div>
                {issue.assignee ? (
                  <a
                    href={issue.assignee.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={issue.assignee.avatar_url} alt={issue.assignee.login} />
                      <AvatarFallback>{issue.assignee.login[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{issue.assignee.login}</span>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No one assigned</p>
                )}
              </div>

              <Separator />

              {/* PR Status */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <GitPullRequest className="h-4 w-4" />
                  <span>Pull Request</span>
                </div>
                {issue.pull_request ? (
                  <a
                    href={issue.pull_request.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    PR Linked
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No PR linked</p>
                )}
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comments</span>
                </div>
                <p className="text-sm font-medium">{issue.comments} comments</p>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Labels</div>
                    <div className="flex flex-wrap gap-2">
                      {issue.labels.map((label) => (
                        <Badge
                          key={label.name}
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: `#${label.color}20`,
                            borderColor: `#${label.color}`,
                            color: `#${label.color}`,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
