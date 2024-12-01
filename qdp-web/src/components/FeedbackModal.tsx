import React, { useEffect, useState } from 'react';
import { Dialog, Text, Button, Flex } from '@radix-ui/themes';
import { Label } from '@radix-ui/react-label';

const baseURL = "https://us-central1-serverless-project-gp3.cloudfunctions.net";
const awsBaseURL = "https://c06677dwsl.execute-api.us-east-1.amazonaws.com/dev";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [processingType, setProcessingType] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUserId();
    }
  }, [isOpen]);

  const fetchUserId = async () => {
    try {
      const response = await fetch(`${awsBaseURL}/extracttoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.userEmail) {
        setUserId(responseData.userEmail);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/store-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          feedback_text: feedback,
          processing_type: processingType,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.statusCode === 200) {
        setPopupMessage('Feedback submitted successfully!');
        setShowPopup(true);
        setFeedback('');
        setProcessingType('');
      } else {
        setPopupMessage(responseData.message || 'An error occurred. Please try again.');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setPopupMessage('An unexpected error occurred. Please try again.');
      setShowPopup(true);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto"
        style={{ position: 'relative' }}
      >
        <Text size="5" weight="bold" className="mb-4">
          Submit Feedback
        </Text>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="processing-type" className="block mb-1 text-gray-700">
              Processing Type
            </Label>
            <select
              id="processing-type"
              required
              className="w-full p-2 border rounded-md text-gray-700 bg-white"
              value={processingType}
              onChange={(e) => setProcessingType(e.target.value)}
            >
              <option value="" disabled>
                Select processing type
              </option>
              <option value="json-to-csv">JSON to CSV</option>
              <option value="name-entity-extraction">Named Entity Extraction</option>
              <option value="word-cloud">Word Cloud</option>
            </select>
          </div>

          <div>
            <Label htmlFor="feedback" className="block mb-1 text-gray-700">
              Feedback
            </Label>
            <textarea
              id="feedback"
              required
              className="w-full p-2 border rounded-md text-gray-700 min-h-[100px] bg-white"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide your feedback..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-100"
          >
            Submit Feedback
          </Button>
        </form>

        <Button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
          variant="soft"
        >
          ✕
        </Button>
      </Dialog.Content>

      {showPopup && (
        <Dialog.Root open={showPopup} onOpenChange={setShowPopup}>
          <Dialog.Content className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto text-center">
            <Text size="4" weight="bold" className="mb-4">
              {popupMessage}
            </Text>
            <Button onClick={() => setShowPopup(false)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              OK
            </Button>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </Dialog.Root>
  );
};

export default FeedbackModal;
