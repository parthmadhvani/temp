import React, { useState, useEffect } from 'react';
import { Button, Box, Text, Dialog, } from '@radix-ui/themes';

interface MathSkillsAuthProps {
  onSubmit: () => void;
  email: string;
}

const MathSkillsAuth: React.FC<MathSkillsAuthProps> = ({ onSubmit,email }) => {
  const [mathQuestion, setMathQuestion] = useState('');
  const [correctAnswer, setOriginalAnswer] = useState<number | null>(null);
  const [userAnswer, setAnswer] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const baseUrl = `${import.meta.env.VITE_AUTH_BASE_URL}`;

  useEffect(() => {
    // Fetch the math question on page load
    const fetchMathQuestion = async () => {
      try {
        const response = await fetch(baseUrl + 'fetchmathsskill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (data.statusCode === 200) {
          setMathQuestion(JSON.parse(data.body).problem);
          setOriginalAnswer(JSON.parse(data.body).answer);
        } else {
          setPopupMessage(JSON.parse(data.body).message || 'Failed to retrieve the math question.');
          setPopupVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setPopupMessage('An unexpected error occurred. Please try again.');
        setPopupVisible(true);
      }
    };

    fetchMathQuestion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(baseUrl + 'verifymathsskill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswer: parseInt(userAnswer, 10), correctAnswer, email }),
      });

      const data = await response.json();
      console.log(data);
      

      if (data.statusCode === 200) {
        onSubmit(); // Call the onSubmit callback on success
        setPopupMessage('Answer verified successfully!');
        // setPopupVisible(true);
        onSubmit(); // Call the onSubmit callback on success
      } else {
        setPopupMessage(data.message || 'Incorrect answer. Please try again.');
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setPopupMessage('An error occurred. Please try again.');
      setPopupVisible(true);
    }
  };

  return (
    <Dialog.Root open>
      <Dialog.Content
        style={{ maxWidth: 450 }}
        className="p-6 rounded-lg bg-white shadow-lg"
      >
        <Dialog.Title>Show your Math Skill</Dialog.Title>
        <Dialog.Description size="2" mb="4" className="text-gray-600">
          Please answer this correctly
        </Dialog.Description>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">{mathQuestion}</label>
            <input type="text" value={userAnswer} onChange={(e) => setAnswer(e.target.value)} required className="border rounded-md p-2 w-full" />
          </div>
          <Button type="submit" className="w-full mt-4">Submit Answer</Button>
        </form>

        {popupVisible && (
          <Dialog.Root open={popupVisible} onOpenChange={setPopupVisible}>
            <Dialog.Content>
            <div>
              <Text size="3" weight="bold">
                {popupMessage}
              </Text>
              </div>
              <Button onClick={() => setPopupVisible(false)} className='mt-5'>
                OK
              </Button>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </Dialog.Content>
    </Dialog.Root>

  );
};

export default MathSkillsAuth;
