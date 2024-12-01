import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard/Dashboard';
import WordCloud from './components/WordCloud';
import NamedEntity from './components/NamedEntity';
import Feedbacks from './components/ListFeedbackPage';
import ListFeedbackPage from './components/ListFeedbackPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/status-bar" element={<StatusBar/>} /> */}
        <Route path="/file-upload" element={<FileUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/word-cloud" element={<WordCloud />} />
        <Route path="/named-entity" element={<NamedEntity />} />
        <Route path="/feedbacks" element={<ListFeedbackPage />} />

      </Routes>
    </Router>
  );
};

export default App;
