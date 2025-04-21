import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';

// Get complete profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        basicInfo: true,
        casteInfo: true,
        occupationInfo: true,
        lifestyleInfo: true,
        personalityInfo: true,
        relationshipPrefs: true,
        valuesPlan: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      profile: user.profile,
      basicInfo: user.basicInfo,
      casteInfo: user.casteInfo,
      occupationInfo: user.occupationInfo,
      lifestyleInfo: user.lifestyleInfo,
      personalityInfo: user.personalityInfo,
      relationshipPrefs: user.relationshipPrefs,
      valuesPlan: user.valuesPlan,
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update main profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { displayName, bio, profilePictureUrl, isHidden } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        displayName,
        bio,
        profilePictureUrl,
        isHidden,
        lastUpdated: new Date(),
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update basic information
export const updateBasicInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { firstName, lastName, gender, birthDate, location, height, maritalStatus, children } =
      req.body;

    const updateObj: any = {};

    if (firstName) updateObj.firstName = firstName;
    if (lastName) updateObj.lastName = lastName;
    if (gender) updateObj.gender = gender;
    if (birthDate) updateObj.birthDate = new Date(birthDate);
    if (location) updateObj.location = location;
    if (height) updateObj.height = height;
    if (maritalStatus) updateObj.maritalStatus = maritalStatus;
    if (children !== undefined) updateObj.children = children;

    const existingBasicInfo = await prisma.basicInfo.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    let updatedInfo;
    if (!existingBasicInfo) {
      console.log('inside');
      updatedInfo = await prisma.basicInfo.create({
        data: {
          userId: req.user.id,
          ...updateObj,
        },
      });
    } else {
      updatedInfo = await prisma.basicInfo.update({
        where: {
          userId: req.user.id,
        },
        data: {
          ...updateObj,
        },
      });
    }

    res.json(updatedInfo);
  } catch (error: any) {
    console.log('Error updating basic info:', error.message);
    res.status(500).json({ error: 'Failed to update basic information' });
  }
};

// Update caste information
export const updateCasteInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { religion, caste, subCaste, motherTongue, community } = req.body;

    let updateData: any = {};
    if (religion) updateData.religion = religion;
    if (caste) updateData.caste = caste;
    if (subCaste) updateData.subCaste = subCaste;
    if (motherTongue) updateData.motherTongue = motherTongue;
    if (community) updateData.community = community;

    const updatedInfo = await prisma.casteInfo.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    res.json(updatedInfo);
  } catch (error) {
    logger.error('Error updating caste info:', error);
    res.status(500).json({ error: 'Failed to update caste information' });
  }
};

// Update occupation information
export const updateOccupationInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      education,
      highestDegree,
      occupation,
      employedIn,
      companyName,
      jobTitle,
      annualIncome,
    } = req.body;

    let dataToUpdate: any = {};
    if (education) dataToUpdate.education = education;
    if (highestDegree) dataToUpdate.highestDegree = highestDegree;
    if (occupation) dataToUpdate.occupation = occupation;
    if (employedIn) dataToUpdate.employedIn = employedIn;
    if (companyName) dataToUpdate.companyName = companyName;
    if (jobTitle) dataToUpdate.jobTitle = jobTitle;
    if (annualIncome) dataToUpdate.annualIncome = annualIncome;

    const updatedInfo = await prisma.occupationInfo.update({
      where: { userId: req.user.id },
      data: dataToUpdate,
    });

    res.json(updatedInfo);
  } catch (error) {
    logger.error('Error updating occupation info:', error);
    res.status(500).json({ error: 'Failed to update occupation information' });
  }
};

// Update lifestyle information
export const updateLifestyleInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { diet, smoking, drinking, livingArrangement, hasDisability, disabilityDetails } =
      req.body;

    let updateData: any = {};

    if (diet) updateData.diet = diet;
    if (smoking) updateData.smoking = smoking;
    if (drinking) updateData.drinking = drinking;
    if (livingArrangement) updateData.livingArrangement = livingArrangement;
    if (hasDisability !== undefined) updateData.hasDisability = hasDisability;
    if (disabilityDetails) updateData.disabilityDetails = disabilityDetails;

    const updatedInfo = await prisma.lifestyleInfo.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    res.json(updatedInfo);
  } catch (error) {
    logger.error('Error updating lifestyle info:', error);
    res.status(500).json({ error: 'Failed to update lifestyle information' });
  }
};

// Update personality information
export const updatePersonalityInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      hobbies,
      interests,
      personalityTraits,
      musicTaste,
      movieTaste,
      sportsInterest,
      travelStyle,
    } = req.body;

    let updateData: any = {};

    if (hobbies) updateData.hobbies = hobbies;
    if (interests) updateData.interests = interests;
    if (personalityTraits) updateData.personalityTraits = personalityTraits;
    if (musicTaste) updateData.musicTaste = musicTaste;
    if (movieTaste) updateData.movieTaste = movieTaste;
    if (sportsInterest) updateData.sportsInterest = sportsInterest;
    if (travelStyle) updateData.travelStyle = travelStyle;

    const updatedInfo = await prisma.personalityInfo.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    res.json(updatedInfo);
  } catch (error) {
    logger.error('Error updating personality info:', error);
    res.status(500).json({ error: 'Failed to update personality information' });
  }
};

// Update relationship preferences
export const updateRelationshipPrefs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      lookingFor,
      ageRangeMin,
      ageRangeMax,
      heightRangeMin,
      heightRangeMax,
      distanceRange,
      preferredReligion,
      preferredCaste,
      educationPreference,
      occupationPreference,
      incomePreference,
    } = req.body;

    let updateData: any = {};

    if (lookingFor) updateData.lookingFor = lookingFor;
    if (ageRangeMin !== undefined) updateData.ageRangeMin = ageRangeMin;
    if (ageRangeMax !== undefined) updateData.ageRangeMax = ageRangeMax;
    if (heightRangeMin !== undefined) updateData.heightRangeMin = heightRangeMin;
    if (heightRangeMax !== undefined) updateData.heightRangeMax = heightRangeMax;
    if (distanceRange !== undefined) updateData.distanceRange = distanceRange;
    if (preferredReligion) updateData.preferredReligion = preferredReligion;
    if (preferredCaste) updateData.preferredCaste = preferredCaste;
    if (educationPreference) updateData.educationPreference = educationPreference;
    if (occupationPreference) updateData.occupationPreference = occupationPreference;
    if (incomePreference) updateData.incomePreference = incomePreference;

    const updatedPrefs = await prisma.relationshipPreference.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    res.json(updatedPrefs);
  } catch (error) {
    logger.error('Error updating relationship preferences:', error);
    res.status(500).json({ error: 'Failed to update relationship preferences' });
  }
};

// Update values and future plans
export const updateValuesPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      familyValues,
      religiousBeliefs,
      politicalViews,
      wantsChildren,
      futureGoals,
      marriagePlans,
      relocateWilling,
    } = req.body;

    let updateData: any = {};

    if (familyValues) updateData.familyValues = familyValues;
    if (religiousBeliefs) updateData.religiousBeliefs = religiousBeliefs;
    if (politicalViews) updateData.politicalViews = politicalViews;
    if (wantsChildren) updateData.wantsChildren = wantsChildren;
    if (futureGoals) updateData.futureGoals = futureGoals;
    if (marriagePlans) updateData.marriagePlans = marriagePlans;
    if (relocateWilling !== undefined) updateData.relocateWilling = relocateWilling;

    const updatedValues = await prisma.valuesPlan.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    res.json(updatedValues);
  } catch (error) {
    logger.error('Error updating values and plans:', error);
    res.status(500).json({ error: 'Failed to update values and future plans' });
  }
};

// Calculate and update profile completion score
export const getProfileCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        basicInfo: true,
        casteInfo: true,
        occupationInfo: true,
        lifestyleInfo: true,
        personalityInfo: true,
        relationshipPrefs: true,
        valuesPlan: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate completion score based on filled fields
    const sections = [
      user.profile,
      user.basicInfo,
      user.casteInfo,
      user.occupationInfo,
      user.lifestyleInfo,
      user.personalityInfo,
      user.relationshipPrefs,
      user.valuesPlan,
    ];

    const totalSections = sections.length;
    const completedSections = sections.filter((section) => section !== null).length;
    const completionScore = (completedSections / totalSections) * 100;

    // Update profile with new completion score
    await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        completionScore,
      },
    });

    res.json({ completionScore });
  } catch (error) {
    logger.error('Error calculating profile completion:', error);
    res.status(500).json({ error: 'Failed to calculate profile completion' });
  }
};
