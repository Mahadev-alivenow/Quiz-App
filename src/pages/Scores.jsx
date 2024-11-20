import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get('/api/scores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScores(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch scores');
        setLoading(false);
      }
    };

    fetchScores();
  }, [token]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Quiz Scores</h2>
      <div className="space-y-4">
        {scores.map((score) => (
          <div
            key={score._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-xl font-semibold mb-2">{score.quiz.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Score</p>
                <p className="text-2xl font-bold">{score.score}/{score.maxScore}</p>
              </div>
              <div>
                <p className="text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold">
                  {Math.floor(score.timeTaken / 60)}:{(score.timeTaken % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Scores;