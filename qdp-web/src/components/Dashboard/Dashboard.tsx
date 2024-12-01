import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import StatusBar from '../StatusBar'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'users' | 'services'>('users')
    const location = useLocation(); // Get location object
    const nevigate = useNavigate();
    const { email } = location.state || {}; // Access the state object

    console.log("from dashboard:"+email);
    
    const handleOptionClick = (id: string) => {
        nevigate("/file-upload",{state:{email:email}});
      };

    return (
        <>
            <div className="fixed top-0 w-full z-10">
                <StatusBar onOptionClick={handleOptionClick} email={email} />
            </div>
            <div className="flex h-screen bg-white pt-16 text-gray-800">
                <Sidebar
                    userName="John Doe"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <MainContent activeTab={activeTab} />
            </div>
        </>
    )
}