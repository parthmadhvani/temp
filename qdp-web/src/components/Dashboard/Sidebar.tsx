// import React from 'react'
// import { User, Settings } from 'lucide-react'

// interface SidebarProps {
//   userName: string
//   activeTab: 'users' | 'services'
//   setActiveTab: (tab: 'users' | 'services') => void
// }

// export const Sidebar: React.FC<SidebarProps> = ({
//   userName,
//   activeTab,
//   setActiveTab,
// }) => {
//   return (
//     <div className="w-64 bg-gray-100 p-6 shadow-md">
//       {/* <h1 className="mb-8 text-2xl font-bold text-gray-800">{userName}</h1> */}
//       <nav>
//         <ul className="space-y-4">
//           <li>
//             <button
//               className={`flex w-full items-center rounded-lg p-2 transition-colors ${
//                 activeTab === 'users'
//                   ? 'bg-black text-white'
//                   : 'text-black hover:bg-black-200'
//               }`}
//               onClick={() => setActiveTab('users')}
//             >
//               <User className="mr-3 h-6 w-6" />
//               Users
//             </button>
//           </li>
//           <li>
//             <button
//               className={`flex w-full items-center rounded-lg p-2 transition-colors ${
//                 activeTab === 'services'
//                   ? 'bg-black text-white'
//                   : 'text-black hover:bg-black-200'
//               }`}
//               onClick={() => setActiveTab('services')}
//             >
//               <Settings className="mr-3 h-6 w-6" />
//               Services
//             </button>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   )
// }


import React from 'react';
import { User, Settings, Clock } from 'lucide-react'; // Added Clock icon for History

interface SidebarProps {
  userName: string;
  activeTab: 'users' | 'services' | 'history'; // Added 'history' to the type
  setActiveTab: (tab: 'users' | 'services' | 'history') => void; // Updated function to include 'history'
}

export const Sidebar: React.FC<SidebarProps> = ({
  userName,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="w-64 bg-gray-100 p-6 shadow-md">
      {/* <h1 className="mb-8 text-2xl font-bold text-gray-800">{userName}</h1> */}
      <nav>
        <ul className="space-y-4">
          <li>
            <button
              className={`flex w-full items-center rounded-lg p-2 transition-colors ${
                activeTab === 'users'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black-200'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <User className="mr-3 h-6 w-6" />
              Users
            </button>
          </li>
          <li>
            <button
              className={`flex w-full items-center rounded-lg p-2 transition-colors ${
                activeTab === 'services'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black-200'
              }`}
              onClick={() => setActiveTab('services')}
            >
              <Settings className="mr-3 h-6 w-6" />
              Services
            </button>
          </li>
          <li>
            <button
              className={`flex w-full items-center rounded-lg p-2 transition-colors ${
                activeTab === 'history'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-black-200'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <Clock className="mr-3 h-6 w-6" /> {/* Using Clock icon */}
              History
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
