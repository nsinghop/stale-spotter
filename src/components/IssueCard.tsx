import { GitHubIssue } from '@/lib/github-api';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Clock, MessageCircle, AlertCircle, CheckCircle2, GitPullRequest } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface IssueCardProps {
  issue: GitHubIssue;
  repoOwner: string;
  repoName: string;
  index: number;
}

export const IssueCard = ({ issue, repoOwner, repoName, index }: IssueCardProps) => {
  const getStatusBadge = () => {
    if (issue.pull_request) {
      return (
        <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
          <GitPullRequest className="h-3 w-3" />
          PR Linked
        </Badge>
      );
    }
    
    if (issue.state === 'closed') {
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3" />
          Closed
        </Badge>
      );
    }

    if (issue.assignee || issue.assignees.length > 0) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceUpdate > 7 && !issue.pull_request) {
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Stale ({daysSinceUpdate}d)
          </Badge>
        );
      }
      
      return (
        <Badge className="gap-1 bg-warning/10 text-warning border-warning/20">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1">
        Open
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/issues/${repoOwner}/${repoName}/${issue.number}`}>
        <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer bg-gradient-card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">#{issue.number}</span>
              </div>

              <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
                {issue.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
                    <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
                  </Avatar>
                  <span>{issue.user.login}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </div>

                {issue.comments > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {issue.comments}
                  </div>
                )}
              </div>

              {issue.assignee && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">Assigned to:</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={issue.assignee.avatar_url} alt={issue.assignee.login} />
                      <AvatarFallback>{issue.assignee.login[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{issue.assignee.login}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {issue.labels.slice(0, 3).map((label) => (
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
              {issue.labels.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{issue.labels.length - 3}
                </Badge>
              )}
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
};
