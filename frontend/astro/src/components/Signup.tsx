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
        description: "Please accept the Privacy Policy and Terms of Service",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign up user...");
      const userCredential = await signUp(email, password);
      console.log("User signed up successfully:", userCredential);
      
      // Save additional user profile data to Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userCredential.uid);
      
      const userProfileData = {
        email: userCredential.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth || null,
        timeOfBirth: timeOfBirth || null,
        placeOfBirth: placeOfBirth.trim() || null,
        timezone: timezone || null,
        astrologicalExperience: astrologicalExperience || null,
        interests: interests.trim() || null,
        notificationPreferences,
        createdAt: new Date().toISOString(),
        profileCompleteness: calculateProfileCompleteness()
      };

      console.log("Saving user profile data:", userProfileData);
      await setDoc(userDocRef, userProfileData);
      
      toast({
        title: "Welcome to Cosmic Hub!",
        description: "Your account has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      console.log("Navigating to home page...");
      navigate("/");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "An error occurred during signup";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompleteness = () => {
    let completedFields = 0;
    const totalOptionalFields = 6; // dateOfBirth, timeOfBirth, placeOfBirth, timezone, experience, interests
    
    if (dateOfBirth) completedFields++;
    if (timeOfBirth) completedFields++;
    if (placeOfBirth.trim()) completedFields++;
    if (timezone) completedFields++;
    if (astrologicalExperience) completedFields++;
    if (interests.trim()) completedFields++;
    
    return Math.round((completedFields / totalOptionalFields) * 100);
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
          <VStack spacing={6}>
            {/* Basic Account Information */}
            <Text color="gold.300" fontSize="xl" fontWeight="bold" alignSelf="flex-start">
              Account Information
            </Text>
            
            <HStack spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">First Name</FormLabel>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="cosmic"
                  size="lg"
                  placeholder="John"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">Last Name</FormLabel>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="cosmic"
                  size="lg"
                  placeholder="Doe"
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="your@email.com"
              />
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="cosmic"
                  size="lg"
                  placeholder="••••••••"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="cosmic"
                  size="lg"
                  placeholder="••••••••"
                />
              </FormControl>
            </HStack>

            {/* Birth Information */}
            <Text color="gold.300" fontSize="xl" fontWeight="bold" alignSelf="flex-start" mt={4}>
              Birth Information
            </Text>
            
            <FormControl>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Date of Birth</FormLabel>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                variant="cosmic"
                size="lg"
              />
            </FormControl>

            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">Time of Birth</FormLabel>
                <Input
                  type="time"
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  variant="cosmic"
                  size="lg"
                />
                <FormHelperText color="whiteAlpha.700">Optional, for accurate Rising sign</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel color="gold.200" fontSize="md" fontWeight="600">Timezone</FormLabel>
                <Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  variant="cosmic"
                  size="lg"
                  placeholder="Select timezone"
                >
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC-7">UTC-7 (MST)</option>
                  <option value="UTC-6">UTC-6 (CST)</option>
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC+1">UTC+1 (CET)</option>
                  <option value="UTC+9">UTC+9 (JST)</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Place of Birth</FormLabel>
              <Input
                type="text"
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="City, Country"
              />
              <FormHelperText color="whiteAlpha.700">For accurate chart calculations</FormHelperText>
            </FormControl>

            {/* Preferences */}
            <Text color="gold.300" fontSize="xl" fontWeight="bold" alignSelf="flex-start" mt={4}>
              Preferences
            </Text>

            <FormControl>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Astrological Experience</FormLabel>
              <Select
                value={astrologicalExperience}
                onChange={(e) => setAstrologicalExperience(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="Select your experience level"
              >
                <option value="beginner">Beginner - New to astrology</option>
                <option value="intermediate">Intermediate - Some knowledge</option>
                <option value="advanced">Advanced - Deep understanding</option>
                <option value="professional">Professional - Practicing astrologer</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Areas of Interest</FormLabel>
              <Textarea
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="What aspects of astrology interest you most?"
                rows={3}
              />
            </FormControl>

            {/* Privacy Consent */}
            <FormControl isRequired mt={4}>
              <Checkbox
                isChecked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                variant="cosmic"
              >
                <Text color="whiteAlpha.900" fontSize="sm">
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
