import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubAPI } from '@/lib/github-api';
import { ContributorCard } from '@/components/ContributorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contributors() {
  const [searchParams] = useSearchParams();
  const repoParam = searchParams.get('repo');
  const [searchTerm, setSearchTerm] = useState('');

  const parseRepo = (repo: string | null) => {
    if (!repo) return null;
    const [owner, name] = repo.split('/');
    return owner && name ? { owner, name } : null;
  };

  const repo = parseRepo(repoParam);

  const { data: contributors, isLoading } = useQuery({
    queryKey: ['contributors', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return [];
      return await githubAPI.getContributors(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  const { data: repoData } = useQuery({
    queryKey: ['repository', repo?.owner, repo?.name],
    queryFn: async () => {
      if (!repo) return null;
      return await githubAPI.getRepository(repo.owner, repo.name);
    },
    enabled: !!repo,
  });

  const filteredContributors = contributors?.filter((contributor) => {
    if (!searchTerm) return true;
    return contributor.login.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!repo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Repository Selected</h2>
          <p className="text-muted-foreground">Please search for a repository from the home page</p>
          <Button onClick={() => (window.location.href = '/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {repoData && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Users className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Contributors</h1>
              <p className="text-muted-foreground">
                {repoData.full_name} has {contributors?.length || 0} contributors
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Contributors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredContributors && filteredContributors.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredContributors.map((contributor, index) => (
            <ContributorCard
              key={contributor.login}
              contributor={contributor}
              index={index}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No contributors found</p>
        </div>
      )}
    </div>
  );
}
