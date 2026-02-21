import { Card, CardContent } from '@/components/ui/card';
import TestInterface from './TestInterface';
import ResultsPanel from './ResultsPanel';
import ResponseViewer from './ResponseViewer';
import type { AppState } from '../App';
import type { StudentResponse } from '../backend';

interface RightPanelContainerProps {
  appState: AppState;
  onTestComplete: (response: StudentResponse) => void;
  onResponseSelect: (response: StudentResponse) => void;
  onBackToWelcome: () => void;
}

export default function RightPanelContainer({
  appState,
  onTestComplete,
  onResponseSelect,
  onBackToWelcome,
}: RightPanelContainerProps) {
  if (appState.viewMode === 'test' && appState.selectedTest) {
    return <TestInterface test={appState.selectedTest} onComplete={onTestComplete} />;
  }

  if (appState.viewMode === 'results' && appState.currentResponse && appState.selectedTest) {
    return (
      <ResultsPanel
        response={appState.currentResponse}
        test={appState.selectedTest}
        onBackToWelcome={onBackToWelcome}
      />
    );
  }

  if (appState.viewMode === 'responses') {
    return <ResponseViewer onResponseSelect={onResponseSelect} selectedResponse={appState.selectedResponseForView} />;
  }

  return (
    <Card className="h-full">
      <CardContent className="flex h-full min-h-[400px] items-center justify-center p-12">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome to IELTS Test Manager</h2>
          <p className="text-muted-foreground">
            Select a test from the left panel to begin, or create a new test to get started.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
