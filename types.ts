export enum Step {
  Welcome = 0,
  BasicProfile = 1,
  CurrentCoverage = 2,
  HealthProfile = 3,
  Budget = 4,
  CarePreferences = 5,
  Review = 6,
  Loading = 7,
  Results = 8,
}

export interface PersonData {
  age: string;
  gender: string;
  citizenship: 'US' | 'Canada' | 'Dual' | 'Other';
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditions: string;
}

export interface UserData {
  planningFor: 'Self' | 'Couple';
  primaryUser: PersonData;
  partnerUser?: PersonData;
  residence: 'US' | 'Canada' | 'Other';
  currency: 'USD' | 'CAD';
  
  // New fields for better recommendations
  immigrationStatus: 'Tourist' | 'Temporary Resident' | 'Permanent Resident' | 'Citizen';
  timeInMexico: '1-3 months' | '3-6 months' | '6-9 months' | '9-12 months';
  returnTripFrequency: 'Rarely' | '1-2 times/year' | 'Monthly/Frequent';
  location: string;
  
  // Coverage
  homeCoverage: string[];
  mexicoCoverage: string[];
  mexicoHistory: string;

  // Risk & Budget
  riskTolerance: 'Low' | 'Moderate' | 'High';
  monthlyBudget: string;
  emergencyFundSource: 'Cash' | 'Credit' | 'None';
  fundingPreference: 'High Premium' | 'Moderate' | 'Low Premium/Self-Fund';

  // Preferences
  majorCarePreference: 'Mexico' | 'Home Country' | 'Mixed';
  spanishComfort: 'Low' | 'Medium' | 'High';
  providerPreference: 'Public' | 'Private' | 'Not Sure';
}

export const INITIAL_DATA: UserData = {
  planningFor: 'Self',
  primaryUser: { age: '', gender: '', citizenship: 'US', healthStatus: 'Good', conditions: '' },
  residence: 'US',
  currency: 'USD',
  immigrationStatus: 'Tourist',
  timeInMexico: '3-6 months',
  returnTripFrequency: '1-2 times/year',
  location: '',
  homeCoverage: [],
  mexicoCoverage: [],
  mexicoHistory: '',
  riskTolerance: 'Moderate',
  monthlyBudget: '',
  emergencyFundSource: 'None',
  fundingPreference: 'Moderate',
  majorCarePreference: 'Mixed',
  spanishComfort: 'Low',
  providerPreference: 'Private',
};