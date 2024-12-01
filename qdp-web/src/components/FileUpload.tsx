

import React, { useState, useEffect } from 'react';
import { UploadIcon } from '@radix-ui/react-icons';
import StatusBar from './StatusBar';
import { useLocation } from 'react-router-dom';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | undefined>(undefined);
  const [fileId, setFileId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]); // State to store table data
  const location = useLocation();
  const { email } = location.state || {};

  // localStorage.setItem('email', email);
  const token = localStorage.getItem('accessToken');
  console.log(token);
  
  const fetchTableData = async () => {
    try {
      const response = await fetch('https://qfhtdmb3m447ercnehofpkanai0hgmbx.lambda-url.us-east-1.on.aws/',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }
      const data = await response.json();
      // console.log  (data);
      
      setTableData(data); // Set table data as an array of objects
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  useEffect(() => {
    fetchTableData();
    console.log(tableData);
    
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessedFileUrl(undefined);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFileContent(reader.result.toString());
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file. Please try again.');
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!fileContent || !file) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    const fileName = encodeURIComponent(file.name);

    let endpoint = `https://c06677dwsl.execute-api.us-east-1.amazonaws.com/dev/uploadJson?filename=${fileName}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ content: fileContent }),
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      setProcessedFileUrl(data.record.outputFileDownloadUrl);
      setFileId(data.record.fileId);

      alert('File uploaded successfully! Processing will begin.');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    }
  };

  const handleButtonMessage = () => {
    return (
      <>
        {processingStatus !== 'completed' ? (
          <button
            disabled
            className="mt-4 px-4 py-2 text-white bg-black rounded-md shadow opacity-50 cursor-not-allowed flex items-center justify-center"
          >
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Processing...
          </button>
        ) : (
          <>
            <a
              href={processedFileUrl}
              download
              className="mt-4 inline-block px-4 py-2 text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 transition-colors duration-200"
            >
              Click To Download
            </a>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <StatusBar email={email} />
      <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Upload Your File</h1>
        <p className="text-xl text-gray-600 text-center mb-8 max-w-md">Convert “json” file to “csv”</p>
        <div className="w-full max-w-xs">
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center px-4 py-2 border border-black rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500 cursor-pointer transition-colors duration-200"
          >
            <UploadIcon className="h-5 w-5 text-white mr-2" aria-hidden="true" />
            <span>{file ? file.name : 'Choose file'}</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Choose file to upload"
            />
          </label>
        </div>
        {file && (
          <p className="mt-4 text-sm text-gray-500">
            Selected file: {file.name}
          </p>
        )}
        {!fileId ? (
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 text-white bg-black rounded-md shadow hover:bg-gray-800 transition-colors duration-200"
          >
            Upload File
          </button>
        ) : (
          handleButtonMessage()
        )}

        {/* Table to display data */}
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Uploaded File Details</h2>
          <table className="table-auto w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Filename</th>
                <th className="border border-gray-300 px-4 py-2">Output File URL</th>
                <th className="border border-gray-300 px-4 py-2">Uploaded at</th>
                <th className="border border-gray-300 px-4 py-2">Reference ID</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={item.fileId}>
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.fileName}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <a href={item.outputFileDownloadUrl} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{item.timestamp}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.referenceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
