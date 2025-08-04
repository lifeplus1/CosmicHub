import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  useToast, 
  Icon, 
  Heading, 
  Text,
  Select,
  Textarea,
  HStack,
  FormHelperText,
  Checkbox
} from "@chakra-ui/react";
import { signUp } from "../auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  console.log("Signup component mounted");
  
  // Basic account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // User profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [timezone, setTimezone] = useState("");
  const [astrologicalExperience, setAstrologicalExperience] = useState("");
  const [interests, setInterests] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState({
    dailyHoroscope: false,
    monthlyForecast: false,
    compatibilityInsights: false,
    newFeatures: false
  });
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted", { email, firstName, lastName });
    setIsLoading(true);

    // Enhanced input validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your first and last name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (!privacyConsent) {
      toast({
        title: "Privacy Consent Required",
        description: "Please accept the privacy policy to continue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const user = await signUp(email, password);
      const db = getFirestore();
      
      // Create comprehensive user profile
      const userProfile = {
        // Basic info
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        
        // Birth information for astrology
        dateOfBirth: dateOfBirth || null,
        timeOfBirth: timeOfBirth || null,
        placeOfBirth: placeOfBirth.trim() || null,
        timezone: timezone || null,
        
        // User preferences and background
        astrologicalExperience: astrologicalExperience || null,
        interests: interests.trim() || null,
        
        // Notification preferences
        notificationPreferences: {
          dailyHoroscope: notificationPreferences.dailyHoroscope,
          monthlyForecast: notificationPreferences.monthlyForecast,
          compatibilityInsights: notificationPreferences.compatibilityInsights,
          newFeatures: notificationPreferences.newFeatures
        },
        
        // Account metadata
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileCompleted: !!(dateOfBirth && timeOfBirth && placeOfBirth),
        privacyConsentGiven: true,
        privacyConsentDate: new Date().toISOString(),
        
        // Analytics and engagement
        signupSource: 'web',
        hasCompletedOnboarding: false,
        totalChartsGenerated: 0,
        lastActiveAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      toast({ title: "Account Created", status: "success", duration: 3000, isClosable: true });
      navigate("/");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Box 
      minH="100vh" 
      pt={8} 
      pb={20}
      px={4}
      background="transparent"
    >
      <Box
        maxW="2xl"
        mx="auto"
        bg="rgba(15, 23, 42, 0.8)"
        backdropFilter="blur(40px)"
        borderRadius="32px"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 32px 120px rgba(0, 0, 0, 0.4)"
        p={8}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '32px',
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: -1,
        }}
      >
        <VStack spacing={6} mb={8}>
          <Icon viewBox="0 0 48 48" boxSize={12} color="gold.300">
            <defs>
              <radialGradient id="signupSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="20" fill="url(#signupSunGradient)" opacity="0.3" />
            <circle cx="24" cy="24" r="12" fill="url(#signupSunGradient)" />
            <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
              <path d="M24 8v-4M24 44v-4M8 24h-4M44 24h-4M35.31 35.31l2.83 2.83M9.86 9.86l2.83 2.83M35.31 12.69l2.83-2.83M9.86 38.14l2.83-2.83" />
            </g>
          </Icon>
          <Heading variant="cosmic" size="2xl" textAlign="center">
            Create Your Cosmic Account
          </Heading>
          <Text variant="stellar" fontSize="lg" textAlign="center">
            Join to unlock personalized astrology insights and save your charts.
          </Text>
        </VStack>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          {/* Basic Account Information */}
          <Text color="gold.200" fontSize="lg" fontWeight="semibold" alignSelf="flex-start">
            Account Information
          </Text>
          
          <HStack spacing={4} w="100%">
            <FormControl isRequired>
              <FormLabel color="yellow.200">First Name</FormLabel>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                placeholder="John"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
                _placeholder={{ color: 'gold.200' }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="yellow.200">Last Name</FormLabel>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                placeholder="Doe"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
                _placeholder={{ color: 'gold.200' }}
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel color="yellow.200">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              placeholder="john@example.com"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              _placeholder={{ color: 'gold.200' }}
            />
          </FormControl>

          <HStack spacing={4} w="100%">
            <FormControl isRequired>
              <FormLabel color="yellow.200">Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                placeholder="••••••••"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
                _placeholder={{ color: 'gold.200' }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="yellow.200">Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                placeholder="••••••••"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
                _placeholder={{ color: 'gold.200' }}
              />
            </FormControl>
          </HStack>

          {/* Birth Information for Astrology */}
          <Text color="gold.200" fontSize="lg" fontWeight="semibold" alignSelf="flex-start" mt={4}>
            Birth Information (For Accurate Charts)
          </Text>
          
          <FormControl>
            <FormLabel color="yellow.200">Date of Birth</FormLabel>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
            />
            <FormHelperText color="gold.300">
              Required for accurate astrological calculations
            </FormHelperText>
          </FormControl>

          <HStack spacing={4} w="100%">
            <FormControl>
              <FormLabel color="yellow.200">Time of Birth</FormLabel>
              <Input
                type="time"
                value={timeOfBirth}
                onChange={(e) => setTimeOfBirth(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="yellow.200">Timezone</FormLabel>
              <Select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                bg="deepPurple.800"
                color="gold.100"
                borderColor="gold.400"
                _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              >
                <option value="">Select Timezone</option>
                <option value="UTC-12">UTC-12 (Baker Island)</option>
                <option value="UTC-11">UTC-11 (Samoa)</option>
                <option value="UTC-10">UTC-10 (Hawaii)</option>
                <option value="UTC-9">UTC-9 (Alaska)</option>
                <option value="UTC-8">UTC-8 (Pacific)</option>
                <option value="UTC-7">UTC-7 (Mountain)</option>
                <option value="UTC-6">UTC-6 (Central)</option>
                <option value="UTC-5">UTC-5 (Eastern)</option>
                <option value="UTC-4">UTC-4 (Atlantic)</option>
                <option value="UTC-3">UTC-3 (Argentina)</option>
                <option value="UTC-2">UTC-2 (South Georgia)</option>
                <option value="UTC-1">UTC-1 (Azores)</option>
                <option value="UTC+0">UTC+0 (London/GMT)</option>
                <option value="UTC+1">UTC+1 (Central Europe)</option>
                <option value="UTC+2">UTC+2 (Eastern Europe)</option>
                <option value="UTC+3">UTC+3 (Moscow)</option>
                <option value="UTC+4">UTC+4 (Dubai)</option>
                <option value="UTC+5">UTC+5 (Pakistan)</option>
                <option value="UTC+6">UTC+6 (Bangladesh)</option>
                <option value="UTC+7">UTC+7 (Thailand)</option>
                <option value="UTC+8">UTC+8 (China/Singapore)</option>
                <option value="UTC+9">UTC+9 (Japan/Korea)</option>
                <option value="UTC+10">UTC+10 (Australia East)</option>
                <option value="UTC+11">UTC+11 (Solomon Islands)</option>
                <option value="UTC+12">UTC+12 (New Zealand)</option>
              </Select>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel color="yellow.200">Place of Birth</FormLabel>
            <Input
              type="text"
              value={placeOfBirth}
              onChange={(e) => setPlaceOfBirth(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              placeholder="City, State/Province, Country"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              _placeholder={{ color: 'gold.200' }}
            />
            <FormHelperText color="gold.300">
              Example: New York, NY, USA or London, England, UK
            </FormHelperText>
          </FormControl>

          {/* User Preferences */}
          <Text color="gold.200" fontSize="lg" fontWeight="semibold" alignSelf="flex-start" mt={4}>
            Personal Preferences
          </Text>

          <FormControl>
            <FormLabel color="yellow.200">Astrological Experience Level</FormLabel>
            <Select
              value={astrologicalExperience}
              onChange={(e) => setAstrologicalExperience(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner - Just getting started</option>
              <option value="intermediate">Intermediate - Some knowledge</option>
              <option value="advanced">Advanced - Experienced practitioner</option>
              <option value="professional">Professional - Astrologer/Student</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color="yellow.200">Areas of Interest</FormLabel>
            <Textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              placeholder="e.g., Natal charts, compatibility, transits, career guidance, spiritual growth..."
              rows={3}
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              _placeholder={{ color: 'gold.200' }}
            />
            <FormHelperText color="gold.300">
              Help us personalize your experience (optional)
            </FormHelperText>
          </FormControl>

          {/* Notification Preferences */}
          <Text color="gold.200" fontSize="lg" fontWeight="semibold" alignSelf="flex-start" mt={4}>
            Notification Preferences
          </Text>

          <VStack spacing={3} align="start" w="100%">
            <Checkbox
              isChecked={notificationPreferences.dailyHoroscope}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                dailyHoroscope: e.target.checked
              }))}
              colorScheme="yellow"
            >
              <Text color="gold.100">Daily horoscope and insights</Text>
            </Checkbox>
            <Checkbox
              isChecked={notificationPreferences.monthlyForecast}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                monthlyForecast: e.target.checked
              }))}
              colorScheme="yellow"
            >
              <Text color="gold.100">Monthly astrological forecasts</Text>
            </Checkbox>
            <Checkbox
              isChecked={notificationPreferences.compatibilityInsights}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                compatibilityInsights: e.target.checked
              }))}
              colorScheme="yellow"
            >
              <Text color="gold.100">Relationship compatibility insights</Text>
            </Checkbox>
            <Checkbox
              isChecked={notificationPreferences.newFeatures}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                newFeatures: e.target.checked
              }))}
              colorScheme="yellow"
            >
              <Text color="gold.100">New features and updates</Text>
            </Checkbox>
          </VStack>

          {/* Privacy Consent */}
          <FormControl isRequired mt={4}>
            <Checkbox
              isChecked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              colorScheme="yellow"
            >
              <Text color="gold.100" fontSize="sm">
                I agree to the <Text as="span" color="gold.300" textDecoration="underline">Privacy Policy</Text> and 
                <Text as="span" color="gold.300" textDecoration="underline"> Terms of Service</Text>
              </Text>
            </Checkbox>
          </FormControl>

          <Button
            type="submit"
            variant="gold"
            isLoading={isLoading}
            size="lg"
            w="100%"
            mt={6}
          >
            Create Cosmic Account
          </Button>
        </VStack>
      </form>
      </Box>
    </Box>
  );
}