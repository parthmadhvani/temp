import React, { useEffect, useState } from 'react';
import { UploadIcon } from '@radix-ui/react-icons';
import StatusBar from './StatusBar';

interface UploadedFile {
  id: string; 
  fileName: string; 
  uploadedAt: string; 
  referenceId: string; 
}


export default function WordCloud() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [wordCloudUrl, setWordCloudUrl] = useState("https://lookerstudio.google.com/embed/reporting/e1884499-f880-4af9-9401-bfb3937900ff/page/Q8xVE");
  const token = localStorage.getItem('accessToken');
  const email = localStorage.getItem('email');
  const [reportUrl, setReportUrl] = useState("");
  const [showIframe, setShowIframe] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]); 
  console.log(localStorage.getItem('email'));


  const apiEndpoint = "https://viqglnnww7yd3tc3ktkzvfd6h40puygb.lambda-url.us-east-1.on.aws/";

  useEffect(() => {
    // Fetch the uploaded files when the component mounts
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            Authorization: token || '',
          },
        });

        console.log(response);
        

        if (!response.ok) {
          throw new Error('Failed to fetch uploaded files');
        }

        const data = await response.json();
        setUploadedFiles(data.data || []);
      } catch (error) {
        console.error('Error fetching uploaded files:', error);
        alert(error);
      }
    };

    fetchUploadedFiles();
  }, [apiEndpoint, token]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

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

    const fileName = encodeURIComponent(file.name);
    let endpoint = `https://c06677dwsl.execute-api.us-east-1.amazonaws.com/dev/uploadTxt?filename=${fileName}`;

    try {
      setIsProcessing(true);
      setProcessingComplete(false);

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
      console.log('Upload response:', data);
      
      //console.log(localStorage.getItem('email'));
      

      var params = {
        user_email: localStorage.getItem('email'),
        fileName: fileName,
      };
      var paramsAsString = JSON.stringify(params);
      var encodedParams = encodeURIComponent(paramsAsString);

      setWordCloudUrl('https://lookerstudio.google.com/embed/reporting/e1884499-f880-4af9-9401-bfb3937900ff/page/Q8xVE');
      const reportUrl = wordCloudUrl + "?params=" + encodedParams;

      console.log("Report URL:", reportUrl);
      setReportUrl(reportUrl);

      const payload = {
        end_time: "2024-11-20T17:23:14.350Z",
        processing_id: data.referenceId,
        processing_type: "json-to-csv",
        result_url: reportUrl,
        start_time: "2024-11-20T17:22:56.818Z",
        status: "completed",
        user_id: localStorage.getItem('email')
      };

      const response2 = await fetch('https://us-central1-serverless-project-gp3.cloudfunctions.net/storeDataProcessingDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Convert payload to JSON
      });

      const responseData = await response2.json();
      console.log('Response:', responseData);

      setProcessingComplete(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowIframe = () => {
    setShowIframe(true);
  };

  return (
    <>
      <StatusBar />
      <div className="min-h-screen flex flex-col items-center bg-gray-100 pt-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Upload Your File</h1>
        <p className="text-xl text-gray-600 text-center mb-8 max-w-md">Display word cloud from “txt” file</p>
        {!processingComplete ? (
          <>
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
              <p className="mt-4 text-sm text-gray-500">Selected file: {file.name}</p>
            )}
            {!isProcessing && (
              <button
                onClick={handleUpload}
                className="mt-4 px-4 py-2 text-white bg-black rounded-md shadow hover:bg-gray-800 transition-colors duration-200"
              >
                Upload File
              </button>
            )}
            {isProcessing && (
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
            )}
          </>
        ) : (
          <>
            {!showIframe ? (
              <button
                onClick={handleShowIframe}
                className="mt-4 px-4 py-2 text-white bg-black rounded-md shadow hover:bg-gray-800 transition-colors duration-200"
              >
                To Word Cloud
              </button>
            ) : (
              <iframe
                src={reportUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{
                  border: 'none',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Word Cloud"
              ></iframe>
            )}
          </>
        )}

        {/* Table Section */}
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Filename</th>
                <th className="border border-gray-300 px-4 py-2">Uploaded At</th>
                <th className="border border-gray-300 px-4 py-2">Reference ID</th>
                <th className="border border-gray-300 px-4 py-2">Link</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, index) => {
                const params = JSON.stringify({
                  user_email: email,
                  fileName: file.fileName,
                });
                const link = `${wordCloudUrl}?params=${encodeURIComponent(params)}`;
                return (
                  <tr key={file.id}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{file.fileName}</td>
                    <td className="border border-gray-300 px-4 py-2">{file.uploadedAt}</td>
                    <td className="border border-gray-300 px-4 py-2">{file.referenceId}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
