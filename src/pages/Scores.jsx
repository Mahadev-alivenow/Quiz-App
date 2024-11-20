import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const newScore = location.state?.score;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchScores = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/scores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch scores");
        setLoading(false);
      }
    };

    fetchScores();
  }, [token, navigate]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {newScore && typeof newScore.percentage === "number" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Quiz Completed!</h3>
          <p>
            Your score: {newScore.score} out of {newScore.maxScore} (
            {newScore.percentage.toFixed(1)}%)
          </p>
          <p>
            Time taken: {Math.floor(newScore.timeTaken / 60)}:
            {(newScore.timeTaken % 60).toString().padStart(2, "0")}
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Your Quiz Scores</h2>
      <div className="space-y-4">
        {scores.map((score) => (
          <div key={score._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">
              {score.quiz?.title || "Untitled Quiz"}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Score</p>
                <p className="text-2xl font-bold">
                  {score.score}/{score.maxScore}
                  <span className="text-lg text-gray-500 ml-2">
                    ({((score.score / score.maxScore) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold">
                  {Math.floor(score.timeTaken / 60)}:
                  {(score.timeTaken % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="text-lg">
                  {new Date(score.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {scores.length === 0 && (
          <p className="text-center text-gray-500">
            No quiz scores yet. Try taking a quiz!
          </p>
        )}
      </div>
    </div>
  );
}

export default Scores;
