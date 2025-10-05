import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchAllUsers();
    fetchMyFriends();
  }, []);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchAllUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMyFriends = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/users/friends/my-friends', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setFriends(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setLoading(false);
    }
  };

  const addFriend = async (friendId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/users/friends/${friendId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Friend added successfully!');
        fetchMyFriends();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to add friend');
      }
    } catch (error) {
      setMessage('Error adding friend');
      console.error('Error:', error);
    }
  };

  const removeFriend = async (friendId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/users/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Friend removed successfully!');
        fetchMyFriends();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error removing friend');
      console.error('Error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {user?.displayName || user?.username}!</h1>
        <button onClick={logout} style={{
          padding: '0.5rem 1rem',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* My Friends */}
        <div>
          <h2>My Friends ({friends.length})</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '1rem' }}>
            {friends.length === 0 ? (
              <p>No friends yet. Add some from the list!</p>
            ) : (
              friends.map(friend => (
                <div key={friend._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <strong>{friend.displayName || friend.username}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>@{friend.username}</div>
                  </div>
                  <button onClick={() => removeFriend(friend._id)} style={{
                    padding: '0.25rem 0.75rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All Users */}
        <div>
          <h2>Find Friends</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
            {users.map(u => {
              const isFriend = friends.some(f => f._id === u._id);
              return (
                <div key={u._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <strong>{u.displayName || u.username}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>@{u.username}</div>
                  </div>
                  {!isFriend && (
                    <button onClick={() => addFriend(u._id)} style={{
                      padding: '0.25rem 0.75rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}>
                      Add Friend
                    </button>
                  )}
                  {isFriend && (
                    <span style={{ color: '#28a745', fontSize: '0.9rem' }}>✓ Friends</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;