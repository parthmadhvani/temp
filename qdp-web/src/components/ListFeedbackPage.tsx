import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import StatusBar from './StatusBar';
import FeedbackModal from './FeedbackModal';

const baseURL = "https://us-central1-serverless-project-gp3.cloudfunctions.net";

interface Feedback {
  id: string;
  feedback_text: string;
  processing_type: string;
  sentiment_magnitude: number;
  sentiment_score: number;
  timestamp: string;
  user_id: string;
}

interface PageInfo {
  hasNextPage: boolean;
  lastDocId: string | null;
  pageSize: number;
  totalFetched: number;
}

const ListFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const response = await fetch(`${baseURL}/extracttoken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const responseData = await response.json();
        if (responseData.statusCode === 200) setUserId(responseData.userEmail);
      } catch (e) {
        console.error(e);
      }
    }
    fetchUserId();
    fetchFeedbacks();
  }, []);

  const getSentimentLabel = (score: number) => {
    if (score <= -0.6) return 'Very Negative';
    if (score <= -0.2) return 'Negative';
    if (score <= 0.2) return 'Neutral';
    if (score <= 0.6) return 'Positive';
    return 'Very Positive';
  };

  const fetchFeedbacks = async (lastDocId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `${baseURL}/get-feedbacks?pageSize=5`;
      if (lastDocId) url += `&lastDocId=${lastDocId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.statusCode === 200) {
        setFeedbacks((prev) =>
          lastDocId ? [...prev, ...result.data.feedbacks] : result.data.feedbacks
        );
        setPageInfo(result.data.pageInfo);
      } else {
        throw new Error(result.message || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedbacks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMore = () => {
    if (pageInfo?.lastDocId) fetchFeedbacks(pageInfo.lastDocId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <StatusBar email={userId} />
      <Box
        className="flex justify-center px-4 pt-8"
        style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}
      >
        <Box
          className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg"
          style={{ textAlign: 'center' }}
        >
          <Flex justify="between" align="center" className="mt-4 mb-4">
            <Text size="4" weight="bold">
              User Feedbacks
            </Text>
            <Button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="mr-2" />
              Add Feedback
            </Button>
          </Flex>

          {error && (
            <Text color="red" className="text-center mb-4 bg-red-100 p-3 rounded">
              {error}
            </Text>
          )}
          <table className="w-full border-collapse border border-gray-300 text-left text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Processing Type</th>
                <th className="border border-gray-300 px-4 py-2">Sentiment</th>
                <th className="border border-gray-300 px-4 py-2">Feedback Text</th>
                <th className="border border-gray-300 px-4 py-2">Timestamp</th>
                <th className="border border-gray-300 px-4 py-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{feedback.processing_type}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 ${getSentimentLabel(feedback.sentiment_score) === 'Very Negative'
                      ? 'text-red-600'
                      : getSentimentLabel(feedback.sentiment_score) === 'Negative'
                        ? 'text-red-400'
                        : getSentimentLabel(feedback.sentiment_score) === 'Neutral'
                          ? 'text-gray-600'
                          : getSentimentLabel(feedback.sentiment_score) === 'Positive'
                            ? 'text-green-400'
                            : 'text-green-600'
                      }`}
                  >
                    {getSentimentLabel(feedback.sentiment_score)} (
                    {feedback.sentiment_score.toFixed(2)})
                  </td>
                  <td className="border border-gray-300 px-4 py-2 truncate">
                    {feedback.feedback_text}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatDate(feedback.timestamp)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{feedback.user_id}</td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-300 px-4 py-6 text-center text-gray-500"
                  >
                    No feedbacks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <Text className="mt-4 text-gray-500">Loading more feedbacks...</Text>
          )}
          {pageInfo?.hasNextPage && (
            <Button
              onClick={handleFetchMore}
              disabled={loading}
              className="mt-6 mx-auto"
            >
              <DownloadIcon />
              Load More Feedbacks
            </Button>
          )}
        </Box>
      </Box>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
};

export default ListFeedbackPage;
