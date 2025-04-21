import { User } from '@prisma/client';
import { getDistanceFromLatLng } from './location';

type UserWithRelations = User & {
  basicInfo?: {
    gender?: string | null;
    birthDate?: Date | null;
    height?: number | null;
    maritalStatus?: string | null;
    children?: string | null;
    location?: any;
  } | null;
  casteInfo?: {
    religion?: string | null;
    caste?: string | null;
    subCaste?: string | null;
    motherTongue?: string | null;
    community?: string | null;
  } | null;
  occupationInfo?: {
    education?: string | null;
    highestDegree?: string | null;
    occupation?: string | null;
    employedIn?: string | null;
    companyName?: string | null;
    jobTitle?: string | null;
    annualIncome?: string | null;
  } | null;
  lifestyleInfo?: {
    diet?: string | null;
    smoking?: string | null;
    drinking?: string | null;
    livingArrangement?: string | null;
  } | null;
  personalityInfo?: {
    hobbies?: string[];
    interests?: string[];
    personalityTraits?: string[];
    musicTaste?: string[];
    movieTaste?: string[];
    sportsInterest?: string[];
    travelStyle?: string | null;
  } | null;
  relationshipPrefs?: {
    lookingFor?: string[];
    preferredReligion?: string[];
    preferredCaste?: string[];
    educationPreference?: string[];
    occupationPreference?: string[];
    incomePreference?: string | null;
  } | null;
  valuesPlan?: {
    familyValues?: string | null;
    religiousBeliefs?: string | null;
    politicalViews?: string | null;
    wantsChildren?: string | null;
    futureGoals?: string[];
    marriagePlans?: string | null;
    relocateWilling?: boolean | null;
  } | null;
};

/**
 * Calculate compatibility score between two users
 * @param user1 First user with profile information
 * @param user2 Second user with profile information
 * @returns Compatibility score between 0-100
 */
export const calculateCompatibilityScore = (
  user1: UserWithRelations,
  user2: UserWithRelations,
): number => {
  const scores: { [key: string]: number } = {
    religion: compareReligion(user1, user2),
    caste: compareCaste(user1, user2),
    education: compareEducation(user1, user2),
    occupation: compareOccupation(user1, user2),
    lifestyle: compareLifestyle(user1, user2),
    interests: compareInterests(user1, user2),
    values: compareValues(user1, user2),
    distance: calculateDistanceScore(user1, user2),
  };

  // Weights for different categories (sum should be 100)
  const weights: { [key: string]: number } = {
    religion: 20,
    caste: 15,
    education: 15,
    occupation: 10,
    lifestyle: 15,
    interests: 15,
    values: 10,
    distance: 8,
  };

  // Calculate weighted score
  let finalScore = 0;
  for (const category in scores) {
    finalScore += (scores[category] * weights[category]) / 100;
  }

  return Math.round(finalScore);
};

/**
 * Compare religion compatibility
 */
const compareReligion = (user1: UserWithRelations, user2: UserWithRelations): number => {
  // If either user is missing religion data, but at least one has preferences, try to use those
  if (!user1.casteInfo?.religion || !user2.casteInfo?.religion) {
    const user1Prefs = user1.relationshipPrefs?.preferredReligion || [];
    const user2Prefs = user2.relationshipPrefs?.preferredReligion || [];

    // If user1 has a religion and it's in user2's preferences
    if (user1.casteInfo?.religion && user2Prefs.includes(user1.casteInfo.religion)) {
      return 70;
    }

    // If user2 has a religion and it's in user1's preferences
    if (user2.casteInfo?.religion && user1Prefs.includes(user2.casteInfo.religion)) {
      return 70;
    }

    return 50; // Neutral if missing and no preference match
  }

  // Exact match
  if (user1.casteInfo.religion === user2.casteInfo.religion) return 100;

  // Check if either user prefers this religion
  const user1Prefs = user1.relationshipPrefs?.preferredReligion || [];
  const user2Prefs = user2.relationshipPrefs?.preferredReligion || [];

  if (
    user1Prefs.includes(user2.casteInfo.religion) &&
    user2Prefs.includes(user1.casteInfo.religion)
  ) {
    return 80; // Both users prefer each other's religion
  } else if (
    user1Prefs.includes(user2.casteInfo.religion) ||
    user2Prefs.includes(user1.casteInfo.religion)
  ) {
    return 60; // One user prefers the other's religion
  }

  return 20; // Different religions and not in preferences
};

/**
 * Compare caste compatibility
 */
const compareCaste = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.casteInfo?.caste || !user2.casteInfo?.caste) return 50; // Neutral if missing

  // Exact match
  if (user1.casteInfo.caste === user2.casteInfo.caste) {
    // Subcaste match adds additional points
    if (
      user1.casteInfo.subCaste &&
      user2.casteInfo.subCaste &&
      user1.casteInfo.subCaste === user2.casteInfo.subCaste
    ) {
      return 100;
    }
    return 90; // Same caste, different subcaste
  }

  // Check if either user prefers this caste
  const user1Prefs = user1.relationshipPrefs?.preferredCaste || [];
  const user2Prefs = user2.relationshipPrefs?.preferredCaste || [];

  if (user1Prefs.includes(user2.casteInfo.caste) && user2Prefs.includes(user1.casteInfo.caste)) {
    return 70; // Both users prefer each other's caste
  } else if (
    user1Prefs.includes(user2.casteInfo.caste) ||
    user2Prefs.includes(user1.casteInfo.caste)
  ) {
    return 50; // One user prefers the other's caste
  }

  return 30; // Different castes and not in preferences
};

/**
 * Compare education compatibility
 */
const compareEducation = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.occupationInfo?.education || !user2.occupationInfo?.education) return 50;

  // Exact match
  if (user1.occupationInfo.education === user2.occupationInfo.education) {
    // Degree match adds additional points
    if (
      user1.occupationInfo.highestDegree &&
      user2.occupationInfo.highestDegree &&
      user1.occupationInfo.highestDegree === user2.occupationInfo.highestDegree
    ) {
      return 100;
    }
    return 90;
  }

  // Check if either user prefers this education level
  const user1Prefs = user1.relationshipPrefs?.educationPreference || [];
  const user2Prefs = user2.relationshipPrefs?.educationPreference || [];

  if (
    user1Prefs.includes(user2.occupationInfo.education) &&
    user2Prefs.includes(user1.occupationInfo.education)
  ) {
    return 80;
  } else if (
    user1Prefs.includes(user2.occupationInfo.education) ||
    user2Prefs.includes(user1.occupationInfo.education)
  ) {
    return 60;
  }

  return 40;
};

/**
 * Compare occupation compatibility
 */
const compareOccupation = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.occupationInfo?.occupation || !user2.occupationInfo?.occupation) return 50;

  // Exact match
  if (user1.occupationInfo.occupation === user2.occupationInfo.occupation) {
    return 90;
  }

  // Check if either user prefers this occupation
  const user1Prefs = user1.relationshipPrefs?.occupationPreference || [];
  const user2Prefs = user2.relationshipPrefs?.occupationPreference || [];

  if (
    user1Prefs.includes(user2.occupationInfo.occupation) &&
    user2Prefs.includes(user1.occupationInfo.occupation)
  ) {
    return 80;
  } else if (
    user1Prefs.includes(user2.occupationInfo.occupation) ||
    user2Prefs.includes(user1.occupationInfo.occupation)
  ) {
    return 60;
  }

  // Check income compatibility if no occupation match
  if (user1.occupationInfo.annualIncome && user2.occupationInfo.annualIncome) {
    // Simplified income comparison
    const income1 = parseIncomeToNumber(user1.occupationInfo.annualIncome);
    const income2 = parseIncomeToNumber(user2.occupationInfo.annualIncome);

    // Within similar income range
    if (Math.abs(income1 - income2) < 500000) {
      return 60;
    }
  }

  return 40;
};

/**
 * Compare lifestyle compatibility
 */
const compareLifestyle = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.lifestyleInfo && !user2.lifestyleInfo) return 50;

  // If one has data but the other doesn't, return a slightly below neutral score
  if (!user1.lifestyleInfo || !user2.lifestyleInfo) return 40;

  let matchPoints = 0;
  let totalFactors = 0;

  // Diet compatibility (higher weight)
  if (user1.lifestyleInfo.diet && user2.lifestyleInfo.diet) {
    totalFactors += 2; // Give diet double weight
    if (user1.lifestyleInfo.diet === user2.lifestyleInfo.diet) {
      matchPoints += 2; // Higher points for exact match
    } else if (
      (user1.lifestyleInfo.diet === 'Vegetarian' && user2.lifestyleInfo.diet === 'Vegan') ||
      (user1.lifestyleInfo.diet === 'Vegan' && user2.lifestyleInfo.diet === 'Vegetarian')
    ) {
      matchPoints += 1;
    } else {
      matchPoints += 0.25; // Small compatibility for other combinations
    }
  }

  // The rest of the function remains the same...
  // (existing smoking, drinking, living arrangement code)

  return totalFactors > 0 ? (matchPoints / totalFactors) * 100 : 50;
};

/**
 * Compare interests compatibility
 */
const compareInterests = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.personalityInfo || !user2.personalityInfo) return 50;

  let matchPoints = 0;
  let totalPoints = 0;

  // Hobbies
  const hobbies1 = user1.personalityInfo.hobbies || [];
  const hobbies2 = user2.personalityInfo.hobbies || [];
  if (hobbies1.length > 0 && hobbies2.length > 0) {
    const sharedHobbies = hobbies1.filter((hobby) => hobbies2.includes(hobby));
    matchPoints += sharedHobbies.length / Math.max(hobbies1.length, hobbies2.length);
    totalPoints += 1;
  }

  // Interests
  const interests1 = user1.personalityInfo.interests || [];
  const interests2 = user2.personalityInfo.interests || [];
  if (interests1.length > 0 && interests2.length > 0) {
    const sharedInterests = interests1.filter((interest) => interests2.includes(interest));
    matchPoints += sharedInterests.length / Math.max(interests1.length, interests2.length);
    totalPoints += 1;
  }

  // Music taste
  const music1 = user1.personalityInfo.musicTaste || [];
  const music2 = user2.personalityInfo.musicTaste || [];
  if (music1.length > 0 && music2.length > 0) {
    const sharedMusic = music1.filter((genre) => music2.includes(genre));
    matchPoints += sharedMusic.length / Math.max(music1.length, music2.length);
    totalPoints += 1;
  }

  // Movie taste
  const movies1 = user1.personalityInfo.movieTaste || [];
  const movies2 = user2.personalityInfo.movieTaste || [];
  if (movies1.length > 0 && movies2.length > 0) {
    const sharedMovies = movies1.filter((genre) => movies2.includes(genre));
    matchPoints += sharedMovies.length / Math.max(movies1.length, movies2.length);
    totalPoints += 1;
  }

  // Sports interest
  const sports1 = user1.personalityInfo.sportsInterest || [];
  const sports2 = user2.personalityInfo.sportsInterest || [];
  if (sports1.length > 0 && sports2.length > 0) {
    const sharedSports = sports1.filter((sport) => sports2.includes(sport));
    matchPoints += sharedSports.length / Math.max(sports1.length, sports2.length);
    totalPoints += 1;
  }

  // Travel style
  if (user1.personalityInfo.travelStyle && user2.personalityInfo.travelStyle) {
    matchPoints +=
      user1.personalityInfo.travelStyle === user2.personalityInfo.travelStyle ? 1 : 0.25;
    totalPoints += 1;
  }

  return totalPoints > 0 ? (matchPoints / totalPoints) * 100 : 50;
};

/**
 * Compare values compatibility
 */
const compareValues = (user1: UserWithRelations, user2: UserWithRelations): number => {
  if (!user1.valuesPlan || !user2.valuesPlan) return 50;

  let matchPoints = 0;
  let totalFactors = 0;

  // Family values
  if (user1.valuesPlan.familyValues && user2.valuesPlan.familyValues) {
    totalFactors++;
    if (user1.valuesPlan.familyValues === user2.valuesPlan.familyValues) {
      matchPoints += 1;
    }
  }

  // Religious beliefs
  if (user1.valuesPlan.religiousBeliefs && user2.valuesPlan.religiousBeliefs) {
    totalFactors++;
    if (user1.valuesPlan.religiousBeliefs === user2.valuesPlan.religiousBeliefs) {
      matchPoints += 1;
    }
  }

  // Political views
  if (user1.valuesPlan.politicalViews && user2.valuesPlan.politicalViews) {
    totalFactors++;
    if (user1.valuesPlan.politicalViews === user2.valuesPlan.politicalViews) {
      matchPoints += 1;
    }
  }

  // Wants children
  if (user1.valuesPlan.wantsChildren && user2.valuesPlan.wantsChildren) {
    totalFactors++;
    if (user1.valuesPlan.wantsChildren === user2.valuesPlan.wantsChildren) {
      matchPoints += 1;
    }
  }

  // Future goals
  const goals1 = user1.valuesPlan.futureGoals || [];
  const goals2 = user2.valuesPlan.futureGoals || [];
  if (goals1.length > 0 && goals2.length > 0) {
    totalFactors++;
    const sharedGoals = goals1.filter((goal) => goals2.includes(goal));
    matchPoints += sharedGoals.length / Math.max(goals1.length, goals2.length);
  }

  // Marriage plans
  if (user1.valuesPlan.marriagePlans && user2.valuesPlan.marriagePlans) {
    totalFactors++;
    if (user1.valuesPlan.marriagePlans === user2.valuesPlan.marriagePlans) {
      matchPoints += 1;
    }
  }

  return totalFactors > 0 ? (matchPoints / totalFactors) * 100 : 50;
};

/**
 * Helper function to convert income string to number for comparison
 */
const parseIncomeToNumber = (income: string): number => {
  // Remove non-numeric characters and convert to number
  const numericIncome = income.replace(/[^0-9]/g, '');
  return parseInt(numericIncome) || 0;
};

/**
 * Add to your helper functions
 * Calculate distance score based on proximity
 */
const calculateDistanceScore = (user1: UserWithRelations, user2: UserWithRelations): number => {
  const user1Location = user1.basicInfo?.location?.coordinates;
  const user2Location = user2.basicInfo?.location?.coordinates;

  if (!user1Location || !user2Location) return 50;

  // Calculate distance in km using the getDistanceFromLatLng function
  const distance = getDistanceFromLatLng(
    user1Location.latitude,
    user1Location.longitude,
    user2Location.latitude,
    user2Location.longitude,
  );

  // Score based on distance:
  if (distance < 10) return 100; // Very close
  if (distance < 30) return 90; // Close
  if (distance < 100) return 80; // Reasonable distance
  if (distance < 300) return 60; // Longer distance
  if (distance < 1000) return 40; // Far
  return 20; // Very far
};
