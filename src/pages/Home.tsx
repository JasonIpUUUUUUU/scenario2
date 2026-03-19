import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Scheduling App</h1>
      <nav>
        <Link to="/login">Login</Link> |{' '}
        <Link to="/register">Register</Link> |{' '}
        <Link to="/calendar">Calendar</Link>
      </nav>
    </div>
  );
};

export default Home;