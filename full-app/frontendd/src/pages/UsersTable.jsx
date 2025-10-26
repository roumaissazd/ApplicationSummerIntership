import React, { useEffect, useState } from 'react';

// Exemple minimaliste de pagination
const PAGE_SIZE = 10;

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Récupère tous les users (via API backend)
  async function fetchUsers() {
    try {
      const res = await fetch('http://localhost:5001/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        alert(data.error || 'Erreur lors de la récupération');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  }

  // Recherche simple sur nom / email
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
      setPage(1);
    }
  }, [searchTerm, users]);

  // Pagination: découpe la liste selon page
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  return (
    <div style={{ padding: 20, backgroundColor: '#f7f8fc', minHeight: '100vh' }}>
      <div style={{
        background: 'white',
        borderRadius: 8,
        padding: 20,
        boxShadow: '0 0 10px #ddd'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
          <h4>DataTable with Buttons</h4>
          <button style={{
            backgroundColor: '#5c6ac4',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: 6,
            cursor: 'pointer'
          }}>+ Add New Record</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            Show{' '}
            <select
              value={PAGE_SIZE}
              onChange={(e) => setPage(1)}
              disabled
              style={{ padding: 4, borderRadius: 4 }}
            >
              <option>10</option>
            </select>{' '}
            entries
          </div>

          <div>
            Search:{' '}
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
              placeholder="Search users"
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
              <th><input type="checkbox" /></th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>No users found</td>
              </tr>
            ) : paginatedUsers.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                <td><input type="checkbox" /></td>
                <td>
                  <div>
                    <strong>{user.firstName} {user.lastName}</strong>
                    <div style={{ fontSize: 12, color: '#888' }}>{user.role}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.role}</td>
                <td>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 10,
                    backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                    color: user.isActive ? '#155724' : '#721c24',
                    fontWeight: 'bold',
                    fontSize: 12,
                  }}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button style={{ marginRight: 5 }}>✏️</button>
                  <button style={{ color: 'red' }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: 15, textAlign: 'right' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              style={{
                marginLeft: 4,
                padding: '4px 8px',
                borderRadius: 4,
                border: pageNumber === page ? '2px solid #5c6ac4' : '1px solid #ccc',
                backgroundColor: pageNumber === page ? '#5c6ac4' : 'white',
                color: pageNumber === page ? 'white' : 'black',
                cursor: 'pointer',
              }}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersTable;
