import React from 'react';
import { Shield, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, step, totalSteps }) => {
  // Don't show progress bar on Welcome (0) or Results (8)
  const showProgress = step > 0 && step < 7;
  const progressPercentage = ((step) / (totalSteps - 2)) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans selection:bg-terra-100 selection:text-terra-900">
      {/* Header */}
      <header className="bg-teal-900 text-white shadow-md no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-terra-500 p-1.5 rounded-full">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold leading-none tracking-wide">Jalisco Health Care Plan</h1>
              <p className="text-xs text-teal-200 font-light">Your Healthcare Funding Blueprint</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-teal-200">
            <Sun className="w-5 h-5 text-terra-500" />
            <span className="text-sm italic">Plan wisely, live fully.</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full bg-gray-200 h-1.5 no-print">
          <div 
            className="bg-terra-500 h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-6 pb-12 px-4 sm:px-6">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-6 text-center text-stone-500 text-sm no-print">
        <p>© {new Date().getFullYear()} Jalisco Health Care Plan. Educational use only.</p>
        <p className="mt-1 text-xs max-w-md mx-auto">
          Not a substitute for professional medical, legal, or financial advice.
        </p>
      </footer>
    </div>
  );
};
