import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  Text,
  Box,
} from '@radix-ui/themes';

interface SecurityQuestionAuthProps {
  onNext: () => void;
  email: string;
}

const SecurityQuestionAuth: React.FC<SecurityQuestionAuthProps> = ({ email, onNext }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const baseUrl = `${import.meta.env.VITE_AUTH_BASE_URL}`;

  useEffect(() => {
    const fetchSecurityQuestion = async () => {
      try {
        const response = await fetch(baseUrl+ 'fetchsecurityquestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setQuestion(JSON.parse(data.body).question);
        } else {
          setPopupMessage(JSON.parse(data.body).message || 'Failed to retrieve the security question.');
          setPopupVisible(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setPopupMessage('An unexpected error occurred. Please try again.');
        setPopupVisible(true);
      }
    };

    fetchSecurityQuestion();
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(baseUrl + 'verifyanswer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer }),
      });

      const data = await response.json();

      if (data.statusCode === 200) {
        setPopupMessage('Answer verified successfully!');
        setPopupVisible(true);
        onNext(); // Trigger the onNext callback on success
      } else {
        setPopupMessage(JSON.parse(data.body).message || 'Incorrect answer. Please try again.');
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
        <Dialog.Title>Security Question</Dialog.Title>
        <Dialog.Description size="2" mb="4" className="text-gray-600">
          Please answer this correctly
        </Dialog.Description>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">{question}</label>
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} required className="border rounded-md p-2 w-full" />
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

export default SecurityQuestionAuth;
