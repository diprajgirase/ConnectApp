const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Helper function to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems<T>(array: T[], min = 1, max = 3): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get random number in range
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random boolean
function getRandomBoolean(): boolean {
  return Math.random() > 0.5;
}

// Generate user seed data
async function generateUsers() {
  // Sample data pools (same as before)
  const genders = ['Male', 'Female', 'Other'];
  const maritalStatuses = ['Never Married', 'Divorced', 'Widowed', 'Separated'];
  const childrenOptions = ['No', 'Yes, living with me', 'Yes, not living with me'];
  const religions = [
    'Hindu',
    'Muslim',
    'Christian',
    'Sikh',
    'Buddhist',
    'Jain',
    'Parsi',
    'Jewish',
    'Other',
  ];

  // Define types for the caste system
  type Religion = 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Other';
  type CasteSystem = Record<Religion, string[]>;

  // Update the castes object with proper typing
  const castes: CasteSystem = {
    Hindu: [
      'Brahmin',
      'Kshatriya',
      'Vaishya',
      'Shudra',
      'Maratha',
      'Rajput',
      'Kayastha',
      'Yadav',
      'Jat',
      'Agarwal',
    ],
    Muslim: [
      'Sunni',
      'Shia',
      'Irani',
      'Bohra',
      'Khoja',
      'Ansari',
      'Sheikh',
      'Syed',
      'Pathan',
      'Memon',
    ],
    Sikh: [
      'Jat',
      'Khatri',
      'Arora',
      'Ramgarhia',
      'Saini',
      'Ramdasia',
      'Bhatia',
      'Mazhabi',
      'Kamboj',
      'Labana',
    ],
    Christian: [
      'Roman Catholic',
      'Protestant',
      'Orthodox',
      'Baptist',
      'Methodist',
      'Evangelical',
      'Anglican',
      'Syrian',
      'Jacobite',
      'Pentecostal',
    ],
    Other: ['Not Applicable'],
  };
  const subCastes = [
    'Konkanastha',
    'Deshastha',
    'Karhade',
    'Vaidharbha',
    'Saraswat',
    'Bavkul',
    'Devrukhe',
    'Karade',
    'Shenvi',
    'Bardeshi',
  ];
  const motherTongues = [
    'Hindi',
    'Marathi',
    'Bengali',
    'Telugu',
    'Tamil',
    'Kannada',
    'Gujarati',
    'Punjabi',
    'Malayalam',
    'Urdu',
    'English',
  ];
  const communities = [
    'Marwari',
    'Punjabi',
    'Bengali',
    'Gujarati',
    'Tamil',
    'Telugu',
    'Maharashtrian',
    'Parsi',
    'Sindhi',
    'Malayali',
    'Kashmiri',
  ];

  const educations = [
    'High School',
    'Diploma',
    'Bachelors',
    'Masters',
    'Doctorate',
    'Post Doctorate',
  ];
  const degrees = [
    'B.Tech',
    'M.Tech',
    'BBA',
    'MBA',
    'BCA',
    'MCA',
    'MBBS',
    'MD',
    'CA',
    'CS',
    'PhD',
    'LLB',
  ];
  const occupations = [
    'Private Sector',
    'Government',
    'Business',
    'Self Employed',
    'Doctor',
    'Engineer',
    'Teacher',
    'Lawyer',
    'Accountant',
    'Architect',
  ];
  const employedIn = [
    'Private Company',
    'Government/Public Sector',
    'Defense/Civil Services',
    'Business/Self Employed',
    'Not Working',
  ];
  const incomeRanges = [
    'Below 1 Lakh',
    '1-3 Lakh',
    '3-6 Lakh',
    '6-10 Lakh',
    '10-15 Lakh',
    '15-20 Lakh',
    '20-30 Lakh',
    '30-50 Lakh',
    '50 Lakh-1 Crore',
    'Above 1 Crore',
  ];

  const diets = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'];
  const smokingOptions = ['Never', 'Occasionally', 'Regularly'];
  const drinkingOptions = ['Never', 'Occasionally', 'Regularly'];
  const livingArrangements = ['With Parents', 'Alone', 'With Friends', 'With Partner', 'In Hostel'];

  const hobbies = [
    'Reading',
    'Writing',
    'Cooking',
    'Baking',
    'Gardening',
    'Photography',
    'Painting',
    'Drawing',
    'Singing',
    'Dancing',
    'Playing Guitar',
    'Playing Piano',
    'Chess',
    'Swimming',
    'Running',
    'Yoga',
    'Meditation',
    'Traveling',
    'Hiking',
    'Cycling',
  ];
  const interests = [
    'Technology',
    'Science',
    'History',
    'Politics',
    'Current Affairs',
    'Psychology',
    'Philosophy',
    'Art',
    'Literature',
    'Fashion',
    'Beauty',
    'Health',
    'Fitness',
    'Food',
    'Wine',
    'Movies',
    'Music',
    'Sports',
    'Travel',
    'Adventure',
  ];
  const personalityTraits = [
    'Ambitious',
    'Analytical',
    'Calm',
    'Charismatic',
    'Compassionate',
    'Confident',
    'Creative',
    'Decisive',
    'Dependable',
    'Determined',
    'Disciplined',
    'Empathetic',
    'Energetic',
    'Enthusiastic',
    'Flexible',
    'Friendly',
    'Generous',
    'Honest',
    'Humorous',
    'Independent',
  ];
  const musicTastes = [
    'Pop',
    'Rock',
    'Hip Hop',
    'R&B',
    'Jazz',
    'Classical',
    'Country',
    'Electronic',
    'Folk',
    'Blues',
    'Metal',
    'Indie',
    'K-pop',
    'Latin',
    'Reggae',
    'Sufi',
    'Bollywood',
    'EDM',
    'Rap',
    'Alternative',
  ];
  const movieTastes = [
    'Action',
    'Adventure',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Fantasy',
    'Historical',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'Western',
    'Animation',
    'Superhero',
    'Biographical',
    'Musical',
    'War',
    'Sports',
  ];
  const sportsInterests = [
    'Cricket',
    'Football',
    'Basketball',
    'Tennis',
    'Badminton',
    'Table Tennis',
    'Chess',
    'Carrom',
    'Swimming',
    'Running',
    'Cycling',
    'Gym',
    'Yoga',
    'Martial Arts',
    'Hockey',
    'Baseball',
    'Volleyball',
    'Rugby',
    'Golf',
    'Formula 1',
  ];
  const travelStyles = [
    'Luxury',
    'Budget',
    'Adventure',
    'Backpacking',
    'Cultural',
    'Relaxation',
    'Road Trips',
    'Beach',
    'Mountains',
    'Countryside',
  ];

  const relationshipTypes = [
    'Marriage',
    'Long Term Relationship',
    'Friendship First',
    'Casual Dating',
  ];
  const familyValues = ['Traditional', 'Moderate', 'Liberal', 'Spiritual', 'Religious'];
  const religiousBeliefs = ['Very Religious', 'Religious', 'Spiritual', 'Not Religious', 'Atheist'];
  const politicalViews = ['Conservative', 'Moderate', 'Liberal', 'Not Political', 'Other'];
  const wantsChildrenOptions = ['Yes, definitely', 'Yes, someday', 'Not sure yet', 'No, never'];
  const futureGoals = [
    'Career Growth',
    'Financial Stability',
    'Starting a Family',
    'Travel the World',
    'Higher Education',
    'Entrepreneurship',
    'Spiritual Growth',
    'Homeownership',
    'Philanthropy',
    'Work-Life Balance',
  ];
  const marriagePlans = [
    'Within 6 months',
    'Within 1 year',
    'Within 2 years',
    'After 2 years',
    'Not Decided Yet',
  ];

  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Surat',
    'Lucknow',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Thane',
    'Bhopal',
    'Visakhapatnam',
    'Patna',
    'Vadodara',
    'Ghaziabad',
  ];
  const states = [
    'Maharashtra',
    'Delhi',
    'Karnataka',
    'Telangana',
    'Tamil Nadu',
    'West Bengal',
    'Gujarat',
    'Rajasthan',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Bihar',
    'Andhra Pradesh',
  ];
  const countries = [
    'India',
    'USA',
    'UK',
    'Canada',
    'Australia',
    'UAE',
    'Singapore',
    'Germany',
    'New Zealand',
    'Netherlands',
  ];

  const companyNames = [
    'Infosys',
    'Tata Consultancy Services',
    'Wipro',
    'HCL Technologies',
    'Tech Mahindra',
    'Cognizant',
    'Accenture',
    'IBM',
    'Microsoft',
    'Google',
    'Amazon',
    'Flipkart',
    'Reliance Industries',
    'Tata Motors',
    'Larsen & Toubro',
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
  ];
  const jobTitles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'Project Manager',
    'Business Analyst',
    'Marketing Manager',
    'Sales Executive',
    'HR Manager',
    'Finance Manager',
    'Operations Manager',
    'Research Associate',
    'Consultant',
    'Analyst',
    'Executive',
    'Director',
    'CEO',
    'CTO',
    'CFO',
    'Architect',
    'Designer',
  ];

  // Create 200 users
  const users = [];

  // --- CHANGE IS HERE ---
  for (let i = 1; i <= 200; i++) {
    // Changed loop limit from 100 to 200
    const gender = getRandomItem(genders);
    // Use modulo 10 for first names, they will repeat more often
    const firstName =
      gender === 'Male'
        ? [
            'Raj',
            'Vikram',
            'Aditya',
            'Rahul',
            'Sandeep',
            'Amit',
            'Nikhil',
            'Prashant',
            'Vivek',
            'Gaurav',
          ][i % 10]
        : [
            'Priya',
            'Neha',
            'Anjali',
            'Pooja',
            'Ritu',
            'Shivani',
            'Deepika',
            'Ananya',
            'Swati',
            'Aditi',
          ][i % 10];

    // Use modulo 20 for last names, they will repeat
    const lastName = [
      'Sharma',
      'Patel',
      'Singh',
      'Gupta',
      'Verma',
      'Joshi',
      'Kumar',
      'Mishra',
      'Desai',
      'Iyer',
      'Shah',
      'Nair',
      'Reddy',
      'Das',
      'Roy',
      'Malhotra',
      'Chopra',
      'Mehra',
      'Bansal',
      'Agarwal',
    ][i % 20];

    // Update the caste selection with proper type checking
    const religion = getRandomItem(religions) as Religion;
    const caste = getRandomItem(religion in castes ? castes[religion] : castes['Other']);

    const birthYear = getRandomNumber(1980, 2002); // Slightly wider range for more users
    const birthMonth = getRandomNumber(1, 12);
    const birthDay = getRandomNumber(1, 28); // Keep it simple, avoid month length issues
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

    // Ensure email uniqueness using 'i'
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}@example.com`;
    const password = await hashPassword('Password123!');

    const height = gender === 'Male' ? getRandomNumber(160, 190) : getRandomNumber(150, 175);
    const maritalStatus = getRandomItem(maritalStatuses);
    const children = getRandomItem(childrenOptions);

    const randomCountry = getRandomItem(countries);
    const randomState = getRandomItem(states);
    const randomCity = getRandomItem(cities);

    const location = {
      country: randomCountry,
      state: randomState,
      city: randomCity,
      coordinates: {
        latitude: 18 + Math.random() * 10, // Example coordinates (adjust if needed)
        longitude: 72 + Math.random() * 10,
      },
    };

    const education = getRandomItem(educations);
    const highestDegree = getRandomItem(degrees);
    const occupation = getRandomItem(occupations);
    const employedInValue = getRandomItem(employedIn);
    const companyName = getRandomItem(companyNames);
    const jobTitle = getRandomItem(jobTitles);
    const annualIncome = getRandomItem(incomeRanges);

    const diet = getRandomItem(diets);
    const smoking = getRandomItem(smokingOptions);
    const drinking = getRandomItem(drinkingOptions);
    const livingArrangement = getRandomItem(livingArrangements);
    const hasDisability = getRandomBoolean() ? false : getRandomBoolean(); // 75% chance of false
    const disabilityDetails = hasDisability ? 'Minor physical disability' : null;

    const userHobbies = getRandomItems(hobbies, 3, 7);
    const userInterests = getRandomItems(interests, 3, 7);
    const userPersonalityTraits = getRandomItems(personalityTraits, 3, 7);
    const userMusicTaste = getRandomItems(musicTastes, 2, 5);
    const userMovieTaste = getRandomItems(movieTastes, 2, 5);
    const userSportsInterest = getRandomItems(sportsInterests, 1, 4);
    const travelStyle = getRandomItem(travelStyles);

    const lookingFor = getRandomItems(relationshipTypes, 1, 2);
    const ageRangeMin = gender === 'Male' ? getRandomNumber(20, 28) : getRandomNumber(20, 30); // Adjusted slightly
    const ageRangeMax = ageRangeMin + getRandomNumber(5, 15);
    const heightRangeMin =
      gender === 'Male' ? getRandomNumber(150, 165) : getRandomNumber(160, 175); // Adjusted slightly
    const heightRangeMax = heightRangeMin + getRandomNumber(10, 20);
    const distanceRange = getRandomNumber(50, 500);
    const preferredReligion = [religion]; // Keep simple for seed
    const preferredCaste = [caste]; // Keep simple for seed
    const educationPreference = getRandomItems(educations, 2, 4);
    const occupationPreference = getRandomItems(occupations, 2, 4);
    const incomePreference = getRandomItem(incomeRanges);

    const familyValue = getRandomItem(familyValues);
    const religiousBelief = getRandomItem(religiousBeliefs);
    const politicalView = getRandomItem(politicalViews);
    const wantsChildren = getRandomItem(wantsChildrenOptions);
    const userFutureGoals = getRandomItems(futureGoals, 2, 5);
    const marriagePlan = getRandomItem(marriagePlans);
    const relocateWilling = getRandomBoolean();

    // Use modulo for profile picture index to avoid exceeding common limits
    const profilePicIndex = (i % 99) + 1; // Use indices 1-99 repeatedly

    users.push({
      email,
      hashedPassword: password,
      phoneNumber: `+91${getRandomNumber(7000000000, 9999999999)}`,
      isVerified: true,
      createdAt: new Date(Date.now() - getRandomNumber(1, 365) * 24 * 60 * 60 * 1000), // Wider creation range
      updatedAt: new Date(),
      lastActive: new Date(Date.now() - getRandomNumber(0, 14) * 24 * 60 * 60 * 1000), // Wider last active range
      profile: {
        displayName: `${firstName} ${lastName}`,
        bio: `Hi, I'm ${firstName}. I am a ${jobTitle} at ${companyName}. Looking forward to connecting with like-minded people. My ID is ${i}.`, // Add ID for easier identification
        completionScore: 100,
        lastUpdated: new Date(),
        isHidden: false,
        profilePictureUrl: `https://randomuser.me/api/portraits/${gender === 'Male' ? 'men' : 'women'}/${profilePicIndex}.jpg`,
      },
      basicInfo: {
        firstName,
        lastName,
        gender,
        birthDate,
        location,
        height,
        maritalStatus,
        children,
      },
      casteInfo: {
        religion,
        caste,
        subCaste: getRandomItem(subCastes),
        motherTongue: getRandomItem(motherTongues),
        community: getRandomItem(communities),
      },
      occupationInfo: {
        education,
        highestDegree,
        occupation,
        employedIn: employedInValue,
        companyName,
        jobTitle,
        annualIncome,
      },
      lifestyleInfo: {
        diet,
        smoking,
        drinking,
        livingArrangement,
        hasDisability,
        disabilityDetails,
      },
      personalityInfo: {
        hobbies: userHobbies,
        interests: userInterests,
        personalityTraits: userPersonalityTraits,
        musicTaste: userMusicTaste,
        movieTaste: userMovieTaste,
        sportsInterest: userSportsInterest,
        travelStyle,
      },
      relationshipPrefs: {
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
      },
      valuesPlan: {
        familyValues: familyValue,
        religiousBeliefs: religiousBelief,
        politicalViews: politicalView,
        wantsChildren,
        futureGoals: userFutureGoals,
        marriagePlans: marriagePlan,
        relocateWilling,
      },
    });
  }

  return users;
}

// Main seed function
async function seed() {
  console.log('Starting database seeding for 200 users...');

  try {
    console.log('Generating user data...');
    const users = await generateUsers();
    console.log(`Generated data for ${users.length} users.`);

    console.log('Cleaning existing database...');
    // Clean existing data in the correct order (respect foreign key constraints)
    // Order is important! Delete dependent tables first.
    await prisma.messageReadReceipt.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chatParticipant.deleteMany({});
    await prisma.match.deleteMany({}); // Depends on ChatRoom
    await prisma.chatRoom.deleteMany({}); // Depends on User (via participants)
    await prisma.block.deleteMany({}); // Depends on User
    await prisma.like.deleteMany({}); // Depends on User
    await prisma.media.deleteMany({}); // Depends on User
    await prisma.notification.deleteMany({}); // Depends on User
    await prisma.userSession.deleteMany({}); // Depends on User
    await prisma.valuesPlan.deleteMany({}); // Depends on User
    await prisma.relationshipPreference.deleteMany({}); // Depends on User
    await prisma.personalityInfo.deleteMany({}); // Depends on User
    await prisma.lifestyleInfo.deleteMany({}); // Depends on User
    await prisma.occupationInfo.deleteMany({}); // Depends on User
    await prisma.casteInfo.deleteMany({}); // Depends on User
    await prisma.basicInfo.deleteMany({}); // Depends on User
    await prisma.profile.deleteMany({}); // Depends on User
    await prisma.user.deleteMany({}); // Delete User last among these

    console.log('Inserting seed data (this might take a while for 200 users)...');

    // Insert users and their related data
    let count = 0;
    for (const userData of users) {
      const {
        profile,
        basicInfo,
        casteInfo,
        occupationInfo,
        lifestyleInfo,
        personalityInfo,
        relationshipPrefs,
        valuesPlan,
        ...user
      } = userData;

      try {
        await prisma.user.create({
          data: {
            ...user,
            profile: { create: profile },
            basicInfo: { create: basicInfo },
            casteInfo: { create: casteInfo },
            occupationInfo: { create: occupationInfo },
            lifestyleInfo: { create: lifestyleInfo },
            personalityInfo: { create: personalityInfo },
            relationshipPrefs: { create: relationshipPrefs },
            valuesPlan: { create: valuesPlan },
          },
        });
        count++;
        if (count % 20 === 0) {
          // Log progress every 20 users
          console.log(`Inserted ${count}/${users.length} users...`);
        }
      } catch (error) {
        console.error(`Failed to insert user ${count + 1} (${user.email}):`, error);
        // Decide if you want to stop or continue on error
        // throw error; // Stop on first error
      }
    }
    console.log(`Finished inserting ${count} users.`);

    console.log('Creating interactions (likes, matches, chats)...');
    // Create some matches, likes, and chat rooms for realistic interactions
    const allUsers = await prisma.user.findMany({
      select: { id: true, basicInfo: { select: { gender: true } } },
    });

    // Update the user filtering with proper types
    interface UserWithGender {
      id: string;
      basicInfo?: {
        gender: string;
      } | null;
    }

    const maleUsers = allUsers.filter((user: UserWithGender) => user.basicInfo?.gender === 'Male');
    const femaleUsers = allUsers.filter(
      (user: UserWithGender) => user.basicInfo?.gender === 'Female',
    );

    console.log(`Found ${maleUsers.length} male users and ${femaleUsers.length} female users.`);

    // Create likes and matches - Scale interactions based on user count
    const interactionCount = Math.min(maleUsers.length, femaleUsers.length);
    const matchesToCreate = Math.floor(interactionCount * 0.4); // ~40% become matches
    const oneWayLikesToCreate = Math.floor(interactionCount * 0.3); // ~30% become one-way likes
    console.log(
      `Attempting to create ~${matchesToCreate} matches and ~${oneWayLikesToCreate} one-way likes.`,
    );

    let matchesCreated = 0;
    let likesCreated = 0;

    // Shuffle users to make interactions more random
    const shuffledMales = [...maleUsers].sort(() => 0.5 - Math.random());
    const shuffledFemales = [...femaleUsers].sort(() => 0.5 - Math.random());

    // Create Matches (Mutual Likes)
    for (
      let i = 0;
      i < Math.min(matchesToCreate, shuffledMales.length, shuffledFemales.length);
      i++
    ) {
      const maleUser = shuffledMales[i];
      const femaleUser = shuffledFemales[i];

      try {
        // Male likes female
        await prisma.like.create({
          data: { fromUserId: maleUser.id, toUserId: femaleUser.id },
        });
        likesCreated++;

        // Female likes male
        await prisma.like.create({
          data: { fromUserId: femaleUser.id, toUserId: maleUser.id },
        });
        likesCreated++;

        // Create chat room
        const chatRoom = await prisma.chatRoom.create({
          data: {
            participants: {
              create: [{ userId: maleUser.id }, { userId: femaleUser.id }],
            },
          },
        });

        // Create match
        await prisma.match.create({
          data: {
            senderId: maleUser.id, // Arbitrarily assign sender/receiver for match record
            receiverId: femaleUser.id,
            status: 'ACCEPTED',
            matchScore: Math.random() * 100,
            chatRoomId: chatRoom.id,
          },
        });
        matchesCreated++;

        // Create some messages
        const conversationStarters = [
          'Hi! I really liked your profile. How are you doing?',
          'Hello! I see we have similar interests. Would love to know more about you.',
          'Hey there! Your profile caught my attention. What are you looking for in a partner?',
          "Hi! I noticed we're both into similar movies. What's your favorite film?",
          "Hello! How's your week going so far?",
        ];
        const responses = [
          "Hi! Thanks for reaching out. I'm doing great, how about you?",
          "Hello! Yes, I noticed that too! I'm interested in learning more about your background.",
          "Hey! I'm looking for someone who shares my values and has similar goals in life. What about you?",
          "Hi there! My favorite movie is probably Inception. What's yours?",
          'Hello! My week is going well, just busy with work. How about yours?',
        ];

        // First message (random sender)
        const firstSenderId = Math.random() > 0.5 ? maleUser.id : femaleUser.id;
        const firstReceiverId = firstSenderId === maleUser.id ? femaleUser.id : maleUser.id;

        await prisma.message.create({
          data: {
            chatRoomId: chatRoom.id,
            senderId: firstSenderId,
            content: getRandomItem(conversationStarters),
            sentAt: new Date(Date.now() - getRandomNumber(1, 7) * 24 * 60 * 60 * 1000),
            status: 'READ', // Assume read for simplicity
          },
        });

        // Response
        await prisma.message.create({
          data: {
            chatRoomId: chatRoom.id,
            senderId: firstReceiverId,
            content: getRandomItem(responses),
            sentAt: new Date(Date.now() - getRandomNumber(0, 6) * 24 * 60 * 60 * 1000),
            status: 'READ', // Assume read
          },
        });
      } catch (error) {
        console.error(
          `Error creating match/chat between ${maleUser.id} and ${femaleUser.id}:`,
          error,
        );
      }
    }
    console.log(`Created ${matchesCreated} matches and initial chats.`);

    // Create One-Way Likes
    // Use remaining users who weren't matched
    const remainingMales = shuffledMales.slice(matchesToCreate);
    const remainingFemales = shuffledFemales.slice(matchesToCreate);
    const oneWayPairs = Math.min(
      oneWayLikesToCreate,
      remainingMales.length,
      remainingFemales.length,
    );

    for (let i = 0; i < oneWayPairs; i++) {
      try {
        // Male likes Female (one way)
        await prisma.like.create({
          data: {
            fromUserId: remainingMales[i].id,
            toUserId: remainingFemales[i].id,
          },
        });
        likesCreated++;
      } catch (error) {
        console.error(
          `Error creating one-way like from ${remainingMales[i].id} to ${remainingFemales[i].id}:`,
          error,
        );
      }
    }
    console.log(`Created ${likesCreated} total likes (including mutual for matches).`);

    console.log('Creating random blocks...');
    // Create some random blocks - Scale slightly with user count
    const blocksToCreate = Math.max(5, Math.floor(allUsers.length / 40)); // ~5 blocks per 200 users
    let blocksCreated = 0;
    for (let i = 0; i < blocksToCreate; i++) {
      const blockerIndex = getRandomNumber(0, allUsers.length - 1);
      let blockedIndex;

      do {
        blockedIndex = getRandomNumber(0, allUsers.length - 1);
      } while (blockerIndex === blockedIndex); // Don't block self

      const blockerId = allUsers[blockerIndex].id;
      const blockedId = allUsers[blockedIndex].id;

      try {
        // Check if block already exists to prevent unique constraint errors
        const existingBlock = await prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: blockerId,
              blockedId: blockedId,
            },
          },
        });

        if (!existingBlock) {
          await prisma.block.create({
            data: {
              blockerId,
              blockedId,
              reason: 'Inappropriate behavior', // Example reason
            },
          });
          blocksCreated++;
        } else {
          console.log(`Skipping duplicate block attempt: ${blockerId} -> ${blockedId}`);
        }
      } catch (error) {
        // Catch potential race conditions or other errors
        console.error(`Error creating block: ${blockerId} -> ${blockedId}`, error);
      }
    }
    console.log(`Created ${blocksCreated} blocks.`);

    console.log('Creating notifications...');
    // Create notifications
    let notificationsCreated = 0;
    for (const user of allUsers) {
      // Define types inside the loop if needed, or keep outside
      type NotificationType = 'MATCH' | 'MESSAGE' | 'LIKE' | 'PROFILE_VIEW' | 'SYSTEM';

      const notificationTypes: NotificationType[] = [
        'MATCH',
        'MESSAGE',
        'LIKE',
        'PROFILE_VIEW',
        'SYSTEM',
      ];

      const notificationTitles: Record<NotificationType, string> = {
        MATCH: 'New Match!',
        MESSAGE: 'New Message!',
        LIKE: 'Someone Liked You!',
        PROFILE_VIEW: 'Someone Viewed Your Profile!',
        SYSTEM: 'Welcome to our Matrimony Platform',
      };
      const notificationMessages: Record<NotificationType, string> = {
        MATCH: 'You have a new match! Start a conversation now.',
        MESSAGE: 'You have received a new message!',
        LIKE: 'Someone has shown interest in your profile!',
        PROFILE_VIEW: 'Your profile is getting attention!',
        SYSTEM: 'Complete your profile to get better matches!',
      };

      // Create 1-3 notifications per user
      const numNotifications = getRandomNumber(1, 3);
      for (let i = 0; i < numNotifications; i++) {
        const notificationType = getRandomItem(notificationTypes) as NotificationType;

        try {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: notificationType,
              title: notificationTitles[notificationType],
              message: notificationMessages[notificationType],
              isRead: getRandomBoolean(),
              createdAt: new Date(Date.now() - getRandomNumber(0, 30) * 24 * 60 * 60 * 1000),
            },
          });
          notificationsCreated++;
        } catch (error) {
          console.error(`Error creating notification for user ${user.id}:`, error);
        }
      }
    }
    console.log(`Created ${notificationsCreated} notifications.`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

// Execute the seed function
seed()
  .then(() => console.log('Seeding script finished execution.'))
  .catch((e) => {
    console.error('Unhandled error during seeding process:', e);
    process.exit(1);
  });
