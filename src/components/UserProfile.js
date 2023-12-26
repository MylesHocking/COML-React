import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_FLASK_API_URL;

const UserProfile = () => {
    const [userInfo, setUserInfo] = useState({
        firstname: '',
        lastname: '',
        sharingPreference: 'Global', // Default to 'Global'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user info from the backend when the component mounts
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint to fetch user info
                const response = await axios.get(`${apiUrl}/api/get_user_profile/${localStorage.getItem("user_id")}`);
                setUserInfo(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Replace with your actual API endpoint to update user info
            await axios.put(`${apiUrl}/api/update_user_profile/${localStorage.getItem("user_id")}`, userInfo);
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            alert('Profile updated successfully!');
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    
    const navigate = useNavigate();
    // Add a function to handle account deletion
    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm("Are you sure you want to delete all your data? This action cannot be undone.");
        if (confirmDelete) {
            // Assuming the user's ID is stored in localStorage
            const userId = localStorage.getItem("user_id");
            axios.delete(`${apiUrl}/api/delete_user/${userId}`)
                .then(response => {
                    console.log(response.data);
                    // navigate to the farewell page
                    navigate('/farewell');
                })
                .catch(error => console.error('Error deleting user:', error));
        }
    };

    return (
        <div>
            <h2>Your Profile</h2>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name:</label>
                    <input
                        className='input-field'
                        type="text"
                        name="firstname"
                        value={userInfo.firstname}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input
                        className='input-field'
                        type="text"
                        name="lastname"
                        value={userInfo.lastname}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Sharing Preference:&nbsp;</label>
                    <select
                        className='input-field'
                        name="sharingPreference"
                        value={userInfo.sharingPreference}
                        onChange={handleChange}
                    >
                        <option value="Global">Global</option>
                        <option value="Sharing">Sharing</option>
                        <option value="Private">Private</option>
                    </select>
                </div>
                <div>
                    <label>Email Notifications:&nbsp;</label>
                    <select
                        className='input-field'
                        name="emailNotifications"
                        value={userInfo.emailNotifications}
                        onChange={handleChange}
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <button className='button' type="submit">Save Changes</button>
            </form>

            {/* Separate section for account deletion */}
            <div className="account-deletion-section">
                <h3>Delete Account</h3>
                <p>This action cannot be undone. Please be certain.</p>
                <button className='button' onClick={handleDeleteAccount}>Delete My Account</button>
            </div>
        </div>
    );
};

export default UserProfile;