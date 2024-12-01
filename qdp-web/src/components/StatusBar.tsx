import React, { useState } from 'react'
import { ExitIcon } from '@radix-ui/react-icons'
import Avatar from '../assets/avatar.svg';
import { useNavigate } from 'react-router-dom';

type StatusBarOption = {
  id: string
  label: string
}

type StatusBarProps = {
  options: StatusBarOption[]
  onOptionClick: (id: string) => void
  onLogout: () => void
  email: string;
}

export default function StatusBar({
  options = [
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' },
  ],
  onOptionClick = () => { },
  onLogout = () => { },
  email,

}: StatusBarProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')

  const navigate = useNavigate();

  const handleButtonClick = (id: string) => {
    setSelectedOption(id) // Update the selected option state
    onOptionClick(id) // Call the parent function to handle option click

    switch (id) {
      case 'option1':
        navigate('/file-upload', { state: { email } }); // Redirect to Page 1
        break;
      case 'option2':
        navigate('/named-entity', { state: { email } }); // Redirect to Page 2
        break;
      case 'option3':
        navigate('/word-cloud', { state: { email } }); // Redirect to Page 3
        break;
      default:
        console.error('Unknown option ID:', id);
    }
  }

  const handleRedirect = () => {
    navigate('/dashboard', { state: { email } });
  };

  const handleFeedbackRedirect = () => {
    navigate('/feedbacks');
  };

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('accessToken')

    // Redirect the user to the home page (or login page)
    window.location.href = '/' // Assuming '/' is your home page
  }

  return (
    <div className="w-full bg-white border-b fixed border-gray-200 px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <span className="text-black font-bold text-lg" onClick={() => navigate('/dashboard')}>QDP WEB</span>
        <nav className="flex space-x-4" aria-label="Status bar options">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleButtonClick(option.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedOption === option.id
                ? 'bg-black text-white' // Apply black background and white text if selected
                : 'bg-white text-black hover:bg-black hover:text-white' // Default styles
                }`}
            >
              {option.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {/* Feedback Button */}
        <button
          onClick={handleFeedbackRedirect}
          className="flex items-center bg-gray-200 text-black hover:text-white hover:bg-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
          aria-label="Feedback"
        >
          Feedback
        </button>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center bg-gray-200 text-black hover:text-white hover:bg-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
          aria-label="Log out"
        >
          <ExitIcon className="w-5 h-5 mr-2" />
          Log out
        </button>
      </div>
    </div>
  )
}

