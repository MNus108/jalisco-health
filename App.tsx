import React, { useState, useEffect } from 'react';
// Explicitly using .tsx extension to resolve build casing issues
import { Layout } from './components/Layout.tsx';
import { WelcomeStep, BasicProfileStep, CurrentCoverageStep, HealthProfileStep, BudgetStep, CarePreferencesStep } from './components/StepWizard';
import { ResultsView } from './components/ResultsView';
import { Step, UserData, PersonData, INITIAL_DATA } from './types';
import { generateBlueprint } from './services/geminiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [userData, setUserData] = useState<UserData>(INITIAL_DATA);
  const [markdownResult, setMarkdownResult] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your profile...");

  const updateData = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const updatePerson = (isPartner: boolean, data: Partial<PersonData>) => {
    if (isPartner) {
      setUserData(prev => ({
        ...prev,
        partnerUser: { ...(prev.partnerUser || { age: '', gender: '', citizenship: 'US', healthStatus: 'Good', conditions: '' }), ...data }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        primaryUser: { ...prev.primaryUser, ...data }
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === Step.CarePreferences) {
      generatePlan();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const generatePlan = async () => {
    setCurrentStep(Step.Loading);
    
    // Start the "Thinking" message cycle
    const messages = [
      "Analyzing your profile...",
      "Checking Seguro Salud Jalisco eligibility...",
      "Comparing private insurance options...",
      "Drafting your personalized blueprint..."
    ];
    
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 1500);

    const startTime = Date.now();
    
    try {
      const result = await generateBlueprint(userData);
      
      // Ensure we show the loading state for at least a few seconds for UX
      const elapsed = Date.now() - startTime;
      const minTime = 3000;
      
      setTimeout(() => {
        clearInterval(msgInterval);
        setMarkdownResult(result);
        setCurrentStep(Step.Results);
      }, Math.max(0, minTime - elapsed));
      
    } catch (e) {
      clearInterval(msgInterval);
      setMarkdownResult("## Error\n\nSomething went wrong. Please try again.");
      setCurrentStep(Step.Results);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.Welcome:
        return <WelcomeStep onStart={() => setCurrentStep(Step.BasicProfile)} />;
      case Step.BasicProfile:
        return <BasicProfileStep userData={userData} updateData={updateData} updatePerson={updatePerson} onNext={handleNext} onBack={handleBack} />;
      case Step.CurrentCoverage:
        return <CurrentCoverageStep userData={userData} updateData={updateData} updatePerson={updatePerson} onNext={handleNext} onBack={handleBack} />;
      case Step.HealthProfile:
        return <HealthProfileStep userData={userData} updateData={updateData} updatePerson={updatePerson} onNext={handleNext} onBack={handleBack} />;
      case Step.Budget:
        return <BudgetStep userData={userData} updateData={updateData} updatePerson={updatePerson} onNext={handleNext} onBack={handleBack} />;
      case Step.CarePreferences:
        return <CarePreferencesStep userData={userData} updateData={updateData} updatePerson={updatePerson} onNext={handleNext} onBack={handleBack} />;
      case Step.Loading:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-fade-in">
             <div className="relative">
               <div className="absolute inset-0 bg-terra-200 rounded-full animate-ping opacity-25"></div>
               <Loader2 className="w-16 h-16 text-terra-600 animate-spin relative z-10" />
             </div>
             
             <div className="space-y-2">
               <h2 className="text-2xl font-serif font-bold text-teal-900 transition-all duration-500">
                 {loadingMessage}
               </h2>
               <p className="max-w-md text-stone-500 mx-auto text-sm">
                 Did you know? Many private hospitals in Jalisco are JCI accredited and offer world-class care at a fraction of US prices.
               </p>
             </div>
          </div>
        );
      case Step.Results:
        return <ResultsView markdownContent={markdownResult} userData={userData} onReset={() => {
          setUserData(INITIAL_DATA);
          setCurrentStep(Step.Welcome);
        }} />;
      default:
        return null;
    }
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  return (
    <Layout step={currentStep} totalSteps={8}>
      {renderStep()}
    </Layout>
  );
};

export default App;
