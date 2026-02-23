import { useState } from 'react';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CreateTestPanel from './CreateTestPanel';
import AuthModal from './AuthModal';
import { useGetAllTests, useDeleteTest } from '../hooks/useQueries';
import { useTestFiltering } from '../hooks/useTestFiltering';
import { useAuth } from '../hooks/useAuth';
import type { Test, TestType } from '../backend';
import { toast } from 'sonner';

interface TestManagementPanelProps {
  onTestSelect: (test: Test) => void;
  onViewResponses: () => void;
  selectedTestId?: bigint;
}

export default function TestManagementPanel({ onTestSelect, onViewResponses, selectedTestId }: TestManagementPanelProps) {
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const { data: tests = [], isLoading } = useGetAllTests();
  const { filteredTests, searchTerm, setSearchTerm, testTypeFilter, setTestTypeFilter } = useTestFiltering(tests);
  const { isAuthenticated, login, getCredentials } = useAuth();
  const deleteTestMutation = useDeleteTest();

  const handleCreateTestClick = () => {
    if (isAuthenticated) {
      setShowCreatePanel(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowCreatePanel(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, test: Test) => {
    e.stopPropagation();
    if (isAuthenticated) {
      setTestToDelete(test);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;

    const credentials = getCredentials();
    if (!credentials) {
      toast.error('Authentication required');
      return;
    }

    try {
      await deleteTestMutation.mutateAsync({
        credentials,
        id: testToDelete.id,
      });
      toast.success('Test deleted successfully');
      setTestToDelete(null);
    } catch (error) {
      toast.error('Failed to delete test');
      console.error('Delete error:', error);
    }
  };

  const getTestTypeBadgeVariant = (type: TestType) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      listening: 'default',
      reading: 'secondary',
      writing: 'outline',
      mixed: 'destructive',
    };
    return variants[type] || 'default';
  };

  const getTestTypeLabel = (type: TestType): string => {
    const labels: Record<string, string> = {
      listening: 'Listening',
      reading: 'Reading',
      writing: 'Writing',
      mixed: 'Mixed',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Button onClick={handleCreateTestClick} className="w-full" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create New Test
        </Button>

        <Button onClick={onViewResponses} variant="outline" className="w-full" size="lg">
          <FileText className="mr-2 h-5 w-5" />
          View All Responses
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="listening">Listening</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="writing">Writing</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 pr-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground">Loading tests...</div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              {tests.length === 0 ? 'No tests created yet' : 'No tests match your filters'}
            </div>
          ) : (
            filteredTests.map((test) => (
              <Card
                key={test.id.toString()}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTestId?.toString() === test.id.toString() ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => onTestSelect(test)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{test.title}</CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getTestTypeBadgeVariant(test.testType)}>
                        {getTestTypeLabel(test.testType)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(e, test)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {test.questions.length} question{test.questions.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onLogin={login}
      />

      {showCreatePanel && (
        <CreateTestPanel
          onClose={() => setShowCreatePanel(false)}
          credentials={getCredentials()}
        />
      )}

      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{testToDelete?.title}"? This action cannot be undone and will also delete all associated student responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTestMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteTestMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTestMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
