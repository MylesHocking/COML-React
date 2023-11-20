import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const apiUrl = process.env.REACT_APP_FLASK_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users`); // Adjust with your API endpoint
        console.log("Fetched users:", response.data); // Add this line
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map(user => (
          <li key={user.user_id}>
            <Link to={`/chart/${user.user_id}`}>{user.firstname} {user.lastname}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
