import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import CandidateDetail from '@/components/CandidateDetail';
import { Candidate } from '@/redux/slices/candidateSlice';
import { Search, Users, TrendingUp, Award } from 'lucide-react';

const InterviewerPage = () => {
  const candidates = useSelector((state: RootState) => state.candidate.candidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('date');

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'date':
          return new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime();
        default:
          return 0;
      }
    });
  }, [candidates, searchTerm, sortBy]);

  const averageScore = useMemo(() => {
    const scores = candidates.filter(c => c.finalScore !== undefined).map(c => c.finalScore!);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [candidates]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-accent text-accent-foreground';
    if (score >= 60) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Interview Dashboard</h1>
          <p className="text-muted-foreground">Review candidate performance and interview results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidates.filter(c => c.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <CardTitle>Candidates</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                  >
                    Date
                  </Button>
                  <Button
                    variant={sortBy === 'score' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('score')}
                  >
                    Score
                  </Button>
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('name')}
                  >
                    Name
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedCandidates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {candidates.length === 0 ? 'No candidates yet' : 'No candidates found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell className="text-muted-foreground">{candidate.email}</TableCell>
                      <TableCell>
                        {candidate.finalScore !== undefined ? (
                          <Badge className={getScoreColor(candidate.finalScore)}>
                            {candidate.finalScore}/100
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {candidate.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {candidate.endTime
                          ? new Date(candidate.endTime).toLocaleDateString()
                          : 'In progress'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CandidateDetail
        candidate={selectedCandidate}
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};

export default InterviewerPage;
