import { GitHubContributor } from '@/lib/github-api';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { GitCommit, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContributorCardProps {
  contributor: GitHubContributor;
  index: number;
  rank?: number;
}

export const ContributorCard = ({ contributor, index, rank }: ContributorCardProps) => {
  const getBadge = () => {
    if (rank === 1) {
      return (
        <Badge className="gap-1 bg-warning/10 text-warning border-warning/20">
          <Award className="h-3 w-3" />
          Top Contributor
        </Badge>
      );
    }
    if (contributor.contributions > 50) {
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20">
          <Award className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-gradient-card">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
              <AvatarFallback className="text-2xl">{contributor.login[0]}</AvatarFallback>
            </Avatar>
            {rank && rank <= 3 && (
              <div className="absolute -top-1 -right-1 bg-warning text-warning-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md">
                #{rank}
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <a
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-lg hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              {contributor.login}
              <ExternalLink className="h-3 w-3" />
            </a>
            
            {getBadge()}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <GitCommit className="h-4 w-4" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{contributor.contributions}</span> contributions
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
