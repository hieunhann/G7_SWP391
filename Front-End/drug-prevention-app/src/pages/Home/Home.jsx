import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <>
      <div className="home-hero centered-hero">
        <div className="hero-content text-center">
          <h1 className="hero-title">Say NO to Drugs</h1>
          <p className="hero-subtitle">
            Join us in raising awareness, educating youth, and building a drug-free community.
          </p>
          <div className="hero-buttons">
            <Link to="/booking">
              <button className="btn-primary">Book a Consultation</button>
            </Link>
            <Link to="/learn-more">
              <button className="btn-secondary">Learn More</button>
            </Link>
          </div>
        </div>
      </div>

      <section className="home-info">
        <h2>Why Drug Prevention Is Important</h2>
        <p>
          Drug use negatively affects mental and physical health, relationships, and the future of young generations.
          Prevention starts with awareness, education, and support systems in schools, families, and communities.
        </p>
      </section>

      <section className="home-features">
        <div className="feature-card">
          <h3>📚 Education</h3>
          <p>Access materials and workshops about the risks of drug use and how to say no.</p>
        </div>
        <div className="feature-card">
          <h3>🧑‍⚕️ Expert Support</h3>
          <p>Book confidential sessions with certified consultants and psychologists.</p>
        </div>
        <div className="feature-card">
          <h3>📢 Campaigns</h3>
          <p>Participate in school and community anti-drug campaigns and events.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>&copy; 2025 Drug Prevention Initiative. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
