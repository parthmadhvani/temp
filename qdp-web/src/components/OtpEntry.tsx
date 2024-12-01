import React, { useState } from 'react';
import { Button, Box, Text, Dialog } from '@radix-ui/themes';
import { Label } from '@radix-ui/react-label';

interface OtpEntryProps {
  onSubmit: () => void;
  Email: string;
}

const OtpEntry: React.FC<OtpEntryProps> = ({ Email, onSubmit }) => {
  const [otp, setOtp] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const baseUrl = `${import.meta.env.VITE_AUTH_BASE_URL}`;


  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length === 6 && /^\d+$/.test(otp)) {
      try {
        const response = await fetch( baseUrl + 'verifyOTP', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: Email, otp }),
        });

        const responseData = await response.json();
        console.log(responseData);
        

        if (responseData.statusCode === 200) {
          setPopupMessage('OTP verification successful!');
          setPopupVisible(true);
          onSubmit();
        } else {
          setPopupMessage(JSON.parse(responseData.body).message || 'OTP verification failed. Please try again.');
          setPopupVisible(true);
        }
      } catch (error) {
        setPopupMessage('An unexpected error occurred. Please try again.');
        setPopupVisible(true);
      }
    } else {
      setPopupMessage('Please enter a valid 6-digit OTP.');
      setPopupVisible(true);
    }
  };

  return (
    <Dialog.Root open>
      <Dialog.Content
        style={{ maxWidth: 450 }}
        className="p-6 rounded-lg bg-white shadow-lg"
      >
        {/* <Text size="6" weight="bold" className="mb-4">
          Enter OTP
        </Text> */}
        <Dialog.Title>Enter OTP</Dialog.Title>

        {/* <Text size="3" className="text-gray-600 mb-4">
          Please enter the 6-digit OTP sent to your registered email.
        </Text> */}
        <Dialog.Description size="2" mb="4" className="text-gray-600">
          Please enter the 6-digit OTP sent to your registered email.
        </Dialog.Description>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp" className="block mb-1">
              OTP
            </Label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className="border rounded-md p-2 w-full text-gray-900"
            />
          </div>

          <Button type="submit" className="w-full mt-4">
            Verify OTP
          </Button>
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

export default OtpEntry;
