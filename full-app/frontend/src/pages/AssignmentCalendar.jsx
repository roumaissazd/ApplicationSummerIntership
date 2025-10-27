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
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem('token');

  // Récupérer rôle et ID
  useEffect(() => {
    if (!token) {
      setError("Veuillez vous connecter.");
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      setUserId(payload.id);
    } catch (e) {
      setError("Token invalide.");
    }
  }, [token]);

  // Fetch données
  const fetchData = async (endpoint, setter) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (endpoint.includes("users") && data.users) setter(data.users);
      else if (endpoint.includes("machines") && data.machines) setter(data.machines);
      else setter(data);
    } catch (err) {
      console.error(`Erreur ${endpoint}:`, err);
      setError(err.message);
    }
  };

  // Charger données
  useEffect(() => {
    if (!token || !userRole) return;
    setLoading(true);
    const endpoint = userRole === 'admin' ? 'assignments' : 'assignments/my';
    Promise.all([
      fetchData(endpoint, setAssignments),
      fetchData("users", setUsers),
      fetchData("machines", setMachines)
    ]).finally(() => setLoading(false));
  }, [token, userRole]);

  // Clic jour
  const handleDayClick = (day) => {
    if (userRole !== 'admin') return;
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

  // Créer assignation
  const handleAddAssignment = async () => {
    if (!selectedUser || !selectedMachine || !selectedDate || !description) {
      alert("Tous les champs sont requis.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          technicianId: selectedUser,
          machineId: selectedMachine,
          day: selectedDate.toISOString().split('T')[0],
          description,
        }),
      });

      if (res.ok) {
        const endpoint = userRole === 'admin' ? 'assignments' : 'assignments/my';
        await fetchData(endpoint, setAssignments);
        resetModal();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
  };

  // Rendu calendrier
  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2" style={{ minHeight: '120px' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAssignments = assignments.filter(a => {
        const assignDate = new Date(a.weekStart);
        return assignDate.toDateString() === date.toDateString();
      });

      days.push(
        <div
          key={day}
          className={userRole === 'admin' ? 'border p-2 cursor-pointer hover:bg-gray-100' : 'border p-2'}
          style={{ minHeight: '120px' }}
          onClick={() => userRole === 'admin' && handleDayClick(date)}
        >
<strong style={{ color: 'white' }}>{day}</strong> {/* Numéro en blanc */}          <div className="mt-1">
            {dayAssignments.length > 0 ? (
              dayAssignments.map(a => (
                <div key={a._id} className="bg-primary text-white rounded p-1 mb-1 small">
                  {a.machine?.name} - {a.notes}
                  {userRole === 'admin' && ` - ${a.technician?.firstName} ${a.technician?.lastName}`}
                </div>
              ))
            ) : (
              <div className="text-muted small">Aucune assignation</div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-primary" onClick={() => changeMonth(-1)}>Précédent</button>
        <h3>{currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
        <button className="btn btn-outline-primary" onClick={() => changeMonth(1)}>Suivant</button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          Calendrier
          <span className={`badge ms-2 ${userRole === 'admin' ? 'bg-success' : 'bg-secondary'}`}>
            {userRole === 'admin' ? 'Admin' : 'Technicien'}
          </span>
        </h4>
      </div>

      <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
          <div key={d} className="text-center fw-bold p-2 border bg-light">{d}</div>
        ))}
        {renderCalendar()}
      </div>

      {/* Modal Admin */}
      {showModal && userRole === 'admin' && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Nouvelle assignation - {selectedDate?.toLocaleDateString('fr-FR')}</h5>
                <button className="btn-close" onClick={resetModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Machine</label>
                  <select className="form-select" value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)}>
                    <option value="">Choisir...</option>
                    {machines.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.serialNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Technicien</label>
                  <select className="form-select" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="">Choisir...</option>
                    {users.filter(u => u.role !== 'admin').map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Description</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={resetModal}>Annuler</button>
                <button className="btn btn-primary" onClick={handleAddAssignment}>Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCalendar;