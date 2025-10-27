import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:5001/api";

const AssignmentCalendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null); // Ajout de l'état pour le rôle utilisateur

  const token = localStorage.getItem('token');

  // Récupérer le rôle de l'utilisateur depuis le token
  useEffect(() => {
    const fetchUserRole = () => {
      try {
        if (token) {
          // Décoder le token pour obtenir les informations de l'utilisateur
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserRole(tokenData.role || 'user');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle utilisateur:', error);
        setUserRole('user');
      }
    };

    fetchUserRole();
  }, [token]);

  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Ajuster en fonction de la structure attendue de l'API
      if (endpoint === "users" && data.users) {
        setter(data.users);
      } else if (endpoint === "machines" && data.machines) {
        setter(data.machines);
      } else {
        setter(data); // Pour les endpoints qui renvoient un tableau directement (ex: assignments)
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(`Erreur lors de la récupération des ${endpoint}: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (token) {
        setLoading(true);
        await Promise.all([
          fetchData("assignments", setAssignments),
          fetchData("users", setUsers),
          fetchData("machines", setMachines)
        ]);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const handleDayClick = (day) => {
    // Vérifier si l'utilisateur est un admin avant de permettre l'ajout d'assignation
    if (userRole !== 'admin') {
      alert("Seuls les administrateurs peuvent créer des assignations.");
      return;
    }
    
    setSelectedDate(day);
    setShowModal(true);
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedUser("");
    setSelectedMachine("");
    setDescription("");
    setSelectedDate(null);
  };

  const handleAddAssignment = async () => {
    if (!selectedUser || !selectedMachine || !selectedDate || !description) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          technicianId: selectedUser,
          machineId: selectedMachine,
          day: selectedDate.toISOString().split('T')[0], // Format YYYY-MM-DD
          description,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAssignments((prev) => [...prev, data]);
        resetModal();
      } else {
        alert(data.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      alert("Erreur lors de l'ajout de l'assignation");
    }
  };

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2" style={{ minHeight: '120px' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAssignments = assignments.filter(a => {
        const assignmentDate = new Date(a.weekStart);
        return assignmentDate.getFullYear() === year &&
               assignmentDate.getMonth() === month &&
               assignmentDate.getDate() === day;
      });

      // Ajouter une classe CSS différente selon le rôle de l'utilisateur
      const dayClass = userRole === 'admin' 
        ? 'border p-2 cursor-pointer hover:bg-gray-100' 
        : 'border p-2 cursor-not-allowed opacity-75';

      days.push(
        <div key={day} className={dayClass} style={{ minHeight: '120px' }} onClick={() => handleDayClick(date)}>
          <strong style={{ color: 'white' }}>{day}</strong>
          <div className="mt-1">
            {dayAssignments.map(a => (
              <div key={a._id} className="bg-primary text-white rounded p-1 mb-1 small">
                {a.machine.name} - {a.notes} - {a.technician.firstName}
              </div>
            ))}
          </div>
          {userRole !== 'admin' && (
            <div className="mt-1 text-xs text-warning">
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-primary" onClick={() => changeMonth(-1)}>Précédent</button>
        <h3>{currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button className="btn btn-outline-primary" onClick={() => changeMonth(1)}>Suivant</button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">
          Calendrier des assignations
          {userRole === 'admin' ? (
            <span className="badge bg-success ms-2">Mode Admin</span>
          ) : (
            <span className="badge bg-secondary ms-2">Mode Lecture</span>
          )}
        </h4>
        {userRole !== 'admin' && (
          <div className="alert alert-info">
            <small>En tant qu'utilisateur non-admin, vous pouvez uniquement consulter les assignations existantes.</small>
          </div>
        )}
      </div>

      <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="text-center fw-bold p-2 border bg-light">{day}</div>
        ))}
        {renderCalendar()}
      </div>

      {/* Modal ajout - uniquement pour les admins */}
      {showModal && userRole === 'admin' && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Nouvelle assignation pour le {selectedDate?.toLocaleDateString('fr-FR')}
                </h5>
                <button type="button" className="btn-close" onClick={resetModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Machine</label>
                  <select
                    className="form-select"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  >
                    <option value="">Sélectionner une machine</option>
                    {machines.length === 0 ? (
                      <option disabled>Aucune machine disponible</option>
                    ) : (
                      machines.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.serialNumber})
                        </option>
                      ))
                    )}
                  </select>
                  {machines.length === 0 && (
                    <div className="form-text text-muted">
                      Vous n'avez créé aucune machine. 
                      <a href="/machines/create" className="ms-1">Créer une machine</a>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label>Description de la panne</label>
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez la panne ou la tâche de maintenance"
                  />
                </div>
                <div className="mb-3">
                  <label>Utilisateur responsable</label>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetModal}>Annuler</button>
<div className="modal-footer">
  <button type="button" className="btn btn-secondary" onClick={resetModal}>Annuler</button>
  <button type="button" className="btn btn-primary" onClick={handleAddAssignment}>Confirmer l'assignation</button>
</div>              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message pour les non-admins qui essaient d'ajouter une assignation */}
      {showModal && userRole !== 'admin' && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Accès refusé</h5>
                <button type="button" className="btn-close" onClick={resetModal}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  Seuls les administrateurs peuvent créer des assignations.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetModal}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCalendar;