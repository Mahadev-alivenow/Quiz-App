import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/api/quizzes`, { headers });
        setQuizzes(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch quizzes");
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [token]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available Quizzes</h2>
      {!token && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Sign in to access all quiz categories!</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500 block">
                  {quiz.questions.length} questions
                </span>
                <span className="text-sm text-gray-500 block">
                  Difficulty: {quiz.difficulty}
                </span>
              </div>
              {token ? (
                <Link
                  to={`/quiz/${quiz._id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Start Quiz
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Login to Start
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizList;
