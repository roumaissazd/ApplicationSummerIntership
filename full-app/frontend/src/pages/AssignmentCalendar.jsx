import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AssignmentCalendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [machines, setMachines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/assignments")
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((error) =>
        console.error("Error fetching assignments:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:5001/api/users?role=technician")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
      .then((data) => setTechnicians(data))
      .catch((error) =>
        console.error("Error fetching technicians:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:5001/api/machines")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
      .then((data) => setMachines(data))
      .catch((error) =>
        console.error("Error fetching machines:", error)
      );
  }, []);

  const handleAddAssignment = async () => {
    if (!selectedTechnician || !selectedMachine || !weekStart || !weekEnd) return

    const response = await fetch("http://localhost:5001/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technicianId: selectedTechnician,
        machineId: selectedMachine,
        weekStart,
        weekEnd,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setAssignments((prev) => [...prev, data]);
      setShowModal(false);
      setSelectedTechnician("");
      setSelectedMachine("");
      setWeekStart("");
      setWeekEnd("");
    } else {
      alert(data.error || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Assignations des techniciens</h3>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Ajouter une assignation
      </button>

      {technicians.map((tech) => (
        <div key={tech._id} className="card mb-2">
          <div className="card-header bg-info text-white">
            {tech.firstName} {tech.lastName}
          </div>
          <ul className="list-group list-group-flush">
            {assignments
              .filter((a) => a.technician._id === tech._id)
              .map((a) => (
                <li key={a._id} className="list-group-item d-flex justify-content-between">
                  {a.machine.name} ({new Date(a.weekStart).toLocaleDateString()} -{" "}
                  {new Date(a.weekEnd).toLocaleDateString()})
                  <span className="badge bg-secondary">{a.status}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {/* Modal ajout */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle assignation</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Technicien</label>
                  <select
                    className="form-select"
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {technicians.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Machine</label>
                  <select
                    className="form-select"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {machines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Date début semaine</label>
                  <input
                    type="date"
                    className="form-control"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label>Date fin semaine</label>
                  <input
                    type="date"
                    className="form-control"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                  />
                </div>
                <button className="btn btn-success w-100" onClick={handleAddAssignment}>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentCalendar;
