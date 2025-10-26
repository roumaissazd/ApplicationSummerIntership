import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const machines = [
  { id: 1, name: 'Machine A' },
  { id: 2, name: 'Machine B' },
  { id: 3, name: 'Machine C' },
  { id: 4, name: 'Machine D' },
];

const Home = () => {
  return (
    <div
      className="min-vh-100 py-5 px-3"
      style={{
        backgroundImage: 'url("/uploads/Capgemini-Logo.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="container bg-white bg-opacity-75 rounded shadow p-4"
        style={{ maxWidth: '1000px' }}
      >
        <h2 className="text-center mb-4 fw-bold">🏠 Dashboard des Machines</h2>
        <div className="row">
          {machines.map((machine) => (
            <div key={machine.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">{machine.name}</h5>
                  <p className="card-text text-muted">Informations sur {machine.name}</p>
                  <Link to="/dashboard" className="btn btn-primary btn-sm">
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
