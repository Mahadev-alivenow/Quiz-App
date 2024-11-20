import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to Quiz App
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Test your knowledge with our interactive quizzes!
      </p>
      <div className="space-x-4">
        <Link
          to="/quizzes"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Start Quiz
        </Link>
      </div>
    </div>
  );
}

export default Home;