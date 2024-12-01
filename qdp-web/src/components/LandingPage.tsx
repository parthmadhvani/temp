import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  Flex,
  Text,
  Avatar,
  Box,
} from '@radix-ui/themes';
import { Label } from '@radix-ui/react-label';
import SecurityQuestionAuth from './SecurityQuestionAuth';
import MathSkillsAuth from './MathSkillsAuth';
import OtpEntry from './OtpEntry';

const LandingPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [userType, setUserType] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [showOtpEntry, setShowOtpEntry] = useState(false);
  const [showMathSkills, setShowMathSkills] = useState(false);
  const [responseUserType, setResponseUserType] = useState('');

  const baseUrl = `${import.meta.env.VITE_AUTH_BASE_URL}`;
  const navigate = useNavigate();

  // Password validation for signup
  useEffect(() => {
    if (isSignup) {
      const validatePassword = (password: string): string => {
        const minLength = /^.{8,}$/;
        const upperCase = /[A-Z]/;
        const lowerCase = /[a-z]/;
        const digit = /[0-9]/;
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (!minLength.test(password)) return 'Password must be at least 8 characters long.';
        if (!upperCase.test(password)) return 'Password must contain at least one uppercase letter.';
        if (!lowerCase.test(password)) return 'Password must contain at least one lowercase letter.';
        if (!digit.test(password)) return 'Password must contain at least one digit.';
        if (!specialChar.test(password)) return 'Password must contain at least one special character.';

        return '';
      };

      setPasswordError(validatePassword(password));
    }
  }, [password, isSignup]); // Only validate password if it's sign up

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If signup and password error, don't proceed
    if (isSignup && passwordError) {
      setPopupMessage(passwordError);
      setPopupVisible(true);
      return;
    }

    const apiUrl = isSignup ? `${baseUrl}signup` : `${baseUrl}login`;
    const payload = {
      email,
      password,
      ...(isSignup && { question: securityQuestion, answer: securityAnswer, userType }),
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("response:");
      
      console.log(JSON.parse(responseData.body).message);
      
      console.log(JSON.parse(responseData.body).userType);
      setResponseUserType(JSON.parse(responseData.body).userType);
      localStorage.setItem('userType', JSON.parse(responseData.body).userType)
      
      localStorage.setItem('email', email);
      console.log(localStorage.getItem('email'));


      if (responseData.statusCode === 200) {
        setPopupMessage(isSignup ? 'Signup successful!' : 'Login successful!');
        setPopupVisible(true);

        if (isSignup) {
          setIsSignup(false);
          setShowOtpEntry(true);
        } else {
          localStorage.setItem('accessToken', JSON.parse(responseData.body).accessToken);
          setShowSecurityQuestion(true);
        }
      } else {
        setPopupMessage(JSON.parse(responseData.body).message || 'An error occurred. Please try again.');
        setPopupVisible(true);
      }
    } catch (error) {
      setPopupMessage('An unexpected error occurred. Please try again.');
      setPopupVisible(true);
    }
  };

  return (
    <div className="bg-black grid grid-cols-2">
      <Box className="w-2/3 min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <Text size="8" weight="bold" className="mb-6">
          Welcome to QDP Web
        </Text>

        <Avatar
          src="https://github.com/radix-ui.png"
          fallback="UI"
          size="6"
          radius="full"
          className="mb-4"
        />

        <Dialog.Root open>
          <Dialog.Content style={{ maxWidth: 450 }} className="p-6 rounded-lg bg-white shadow-lg">
            <Dialog.Title>{isSignup ? 'Sign Up' : 'Login'}</Dialog.Title>
            <Dialog.Description className="text-gray-600">
              {isSignup ? 'Create a new account' : 'Log in to your account'}
            </Dialog.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block mb-1">Email</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="border rounded-md p-2 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password" className="block mb-1">Password</Label>
                <input
                  id="password"
                  type="password"
                  required
                  className="border rounded-md p-2 w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isSignup && passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>

              {isSignup && (
                <>
                  <div>
                    <Label htmlFor="user-type" className="block mb-1">User Type</Label>
                    <select
                      id="user-type"
                      required
                      className="border rounded-md p-2 w-full"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                    >
                      <option value="" disabled>Select user type</option>
                      <option value="admin">QDP Agent</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="security-question" className="block mb-1">Security Question</Label>
                    <select
                      id="security-question"
                      required
                      className="border rounded-md p-2 w-full"
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                    >
                      <option value="" disabled>Select a question</option>
                      <option value="What is your favorite color?">What is your favorite color?</option>
                      <option value="What is the name of your first pet?">What is the name of your first pet?</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="security-answer" className="block mb-1">Answer</Label>
                    <input
                      id="security-answer"
                      required
                      className="border rounded-md p-2 w-full"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSignup && Boolean(passwordError)} // Disable button if password is invalid during sign up
              >
                {isSignup ? 'Sign Up' : 'Login'}
              </Button>
            </form>

            <Flex justify="between" mt="4">
              <Button variant="soft" color="blue" onClick={() => setIsSignup(!isSignup)} className="text-sm">
                {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {popupVisible && (
          <Dialog.Root open={popupVisible} onOpenChange={setPopupVisible}>
            <Dialog.Content>
              <Text size="3" weight="bold">{popupMessage}</Text>
              <Button onClick={() => setPopupVisible(false)} className="mt-5">OK</Button>
            </Dialog.Content>
          </Dialog.Root>
        )}

        {showSecurityQuestion && <SecurityQuestionAuth email={email} onNext={() => setShowMathSkills(true)} />}
        {showOtpEntry && <OtpEntry email={email} onSubmit={() => setShowOtpEntry(false)} />}
        {showMathSkills && <MathSkillsAuth email={email} onSubmit={() => navigate('/file-upload', { state: { email: email, userType: responseUserType } })} />}
      </Box>
    </div>
  );
};

export default LandingPage;
