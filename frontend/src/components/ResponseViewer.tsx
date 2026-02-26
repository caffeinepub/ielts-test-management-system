import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Eye } from 'lucide-react';
import { useGetAllStudentResponses, useGetAllTests, useDeleteStudentResponse } from '../hooks/useQueries';
import { useResponseManagement } from '../hooks/useResponseManagement';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import ResponseDetailsPanel from './ResponseDetailsPanel';
import type { StudentResponse } from '../backend';

interface ResponseViewerProps {
  onResponseSelect: (response: StudentResponse) => void;
  selectedResponse: StudentResponse | null;
}

export default function ResponseViewer({ onResponseSelect, selectedResponse }: ResponseViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<bigint | null>(null);

  const { data: responses = [], isLoading: responsesLoading } = useGetAllStudentResponses();
  const { data: tests = [] } = useGetAllTests();
  const deleteResponseMutation = useDeleteStudentResponse();
  const { filteredResponses } = useResponseManagement(responses, searchTerm);
  const { login } = useAuth();

  const getTestTitle = (testId: bigint) => {
    const test = tests.find((t) => t.id === testId);
    return test?.title || 'Unknown Test';
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Always open the auth modal when delete is clicked — credentials are always required
  const handleDeleteClick = (id: bigint) => {
    setPendingDeleteId(id);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (_username: string, _password: string) => {
    // Credentials have been validated by AuthModal via the login callback.
    // Proceed with the pending delete.
    if (pendingDeleteId !== null) {
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      setAuthModalOpen(false);
      deleteResponseMutation.mutate(idToDelete);
    }
  };

  const handleAuthClose = () => {
    setAuthModalOpen(false);
    setPendingDeleteId(null);
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (band >= 7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (band >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  if (selectedResponse) {
    const test = tests.find((t) => t.id === selectedResponse.testId);
    return (
      <ResponseDetailsPanel
        response={selectedResponse}
        test={test || null}
        onClose={() => onResponseSelect(null as any)}
      />
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Student Responses</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {responsesLoading ? (
            <div className="text-center text-sm text-muted-foreground">Loading responses...</div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              {responses.length === 0 ? 'No responses submitted yet' : 'No responses match your search'}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Band</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => (
                    <TableRow key={response.id.toString()}>
                      <TableCell className="font-medium">{response.studentName}</TableCell>
                      <TableCell>{response.batchNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{getTestTitle(response.testId)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(response.submissionTimestamp)}
                      </TableCell>
                      <TableCell>{response.totalScore.toString()}</TableCell>
                      <TableCell>
                        <Badge className={getBandColor(response.estimatedBand)}>
                          {response.estimatedBand.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onResponseSelect(response)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(response.id)}
                            disabled={deleteResponseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AuthModal
        open={authModalOpen}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        onLogin={login}
        description="Enter your username and password to delete this response."
      />
    </>
  );
}
