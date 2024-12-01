// import React from 'react'

// interface MainContentProps {
//   activeTab: 'users' | 'services'
// }

// export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
//   return (
//     <div className="flex-1 p-8">
//       <h2 className="mb-6 text-3xl font-bold text-gray-800">
//         {activeTab === 'users' ? 'Users' : 'Services'}
//       </h2>
//       {activeTab === 'users' ? (
//         <div className="rounded-lg bg-white p-6 shadow-md">
//           <p className="text-gray-600">User management content goes here.</p>
//         </div>
//       ) : (
//         <div className="rounded-lg bg-white p-6 shadow-md">
//           <p className="text-gray-600">Services management content goes here.</p>
//         </div>
//       )}
//     </div>
//   )
// }

import React from 'react';

interface MainContentProps {
  activeTab: 'users' | 'services' | 'history'; // Added 'history' as a valid tab
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  return (
    <div className="flex-1 p-8">
      <h2 className="mb-6 text-3xl font-bold text-gray-800">
        {activeTab === 'users'
          ? 'Users'
          : activeTab === 'services'
          ? 'Services'
          : 'History'} {/* Dynamic title */}
      </h2>
      {activeTab === 'users' ? (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-gray-600">User management content goes here.</p>
        </div>
      ) : activeTab === 'services' ? (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-gray-600">Services management content goes here.</p>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-gray-600">
            This is the **History** tab. Here, you can view and manage your recent activities or logs.
          </p>
        </div>
      )}
    </div>
  );
};
