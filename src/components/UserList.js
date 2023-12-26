import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserList.css';

const apiUrl = process.env.REACT_APP_FLASK_API_URL;

function UserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
      try {
        const currentUserId = localStorage.getItem("user_id");
        const response = await axios.get(`${apiUrl}/api/users`, { params: { userId: currentUserId } });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  /*const handleFriendAction = async (targetUserId, action) => {
    try {
      await axios.post(`${apiUrl}/api/friend_action`, { userId: localStorage.getItem("user_id"), targetUserId, action });
      // Update the user list to reflect the new friendship status
      // This could be a re-fetch or a local state update
      fetchUsers();
    } catch (error) {
      console.error(`Error performing friend action (${action}):`, error);
    }
  };*/

  return (
    <div>
      <h1>User List</h1>
      <div className="user-list-wrapper">
        <ul>
          {users.map(user => (
            <li key={user.user_id} className="user-list-item">
              <div className="user-info">
                <Link to={`/chart/${user.user_id}`} className="user-name">{user.firstname} {user.lastname}</Link>
              </div>
              {
              <Link to={`/chart/${user.user_id}`} className="view-chart-link">View Chart</Link>
              }
              {/*user.is_friend
                ? <button className='button' onClick={() => handleFriendAction(user.user_id, 'unfriend')}>Unfriend</button>
                : <button className='button' onClick={() => handleFriendAction(user.user_id, 'addFriend')}>Add Friend</button>
              */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserList;
