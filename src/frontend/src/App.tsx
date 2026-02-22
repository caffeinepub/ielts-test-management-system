import { useState } from 'react';
import TestManagementPanel from './components/TestManagementPanel';
import RightPanelContainer from './components/RightPanelContainer';
import Footer from './components/Footer';
import type { Test, StudentResponse } from './backend';

export type ViewMode = 'welcome' | 'test' | 'results' | 'responses';

export interface AppState {
  viewMode: ViewMode;
  selectedTest: Test | null;
  currentResponse: StudentResponse | null;
  selectedResponseForView: StudentResponse | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    viewMode: 'welcome',
    selectedTest: null,
    currentResponse: null,
    selectedResponseForView: null,
  });

  const handleTestSelect = (test: Test) => {
    setAppState({
      viewMode: 'test',
      selectedTest: test,
      currentResponse: null,
      selectedResponseForView: null,
    });
  };

  const handleTestComplete = (response: StudentResponse) => {
    setAppState({
      ...appState,
      viewMode: 'results',
      currentResponse: response,
    });
  };

  const handleViewResponses = () => {
    setAppState({
      viewMode: 'responses',
      selectedTest: null,
      currentResponse: null,
      selectedResponseForView: null,
    });
  };

  const handleResponseSelect = (response: StudentResponse) => {
    setAppState({
      ...appState,
      selectedResponseForView: response,
    });
  };

  const handleBackToWelcome = () => {
    setAppState({
      viewMode: 'welcome',
      selectedTest: null,
      currentResponse: null,
      selectedResponseForView: null,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="z-20 flex-shrink-0 border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">IELTS Test Management by Sayem</h1>
          <p className="text-sm text-muted-foreground">Practice tests with instant scoring and band estimation</p>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col gap-6 overflow-hidden px-4 py-6 lg:flex-row">
        <aside className="flex-shrink-0 lg:w-80 xl:w-96">
          <TestManagementPanel
            onTestSelect={handleTestSelect}
            onViewResponses={handleViewResponses}
            selectedTestId={appState.selectedTest?.id}
          />
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <RightPanelContainer
            appState={appState}
            onTestComplete={handleTestComplete}
            onResponseSelect={handleResponseSelect}
            onBackToWelcome={handleBackToWelcome}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
