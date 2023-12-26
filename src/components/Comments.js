import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Comments = ({ apiUrl, entityId, entityType }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    useEffect(() => {
        const fetchComments = async () => {
            console.log('Comments apiUrl', apiUrl);
            try {
                let params = {};
                if (entityType === "event") {
                    params = { event_id: entityId };
                } else if (entityType === "car") {
                    params = { user_car_association_id: entityId };
                } else {
                    params = { car_chart_user_id : entityId };
                }
                console.log('Comments apiUrl', apiUrl , 'params' , params);
                const response = await axios.get(`${apiUrl}/api/get_comments`, { params });
                console.log('Comments response', response);
                setComments(response.data || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [entityId, entityType, apiUrl]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const commentData = {
            user_id: localStorage.getItem("user_id"), 
            text: newComment
        };
        // Add the appropriate ID based on entityType
        if (entityType === "event") {
            commentData.event_id = entityId;
        } else if (entityType === "car") {
            commentData.user_car_association_id = entityId;
        } else {
            commentData.car_chart_user_id = entityId;
        }
        console.log('commentData', commentData);
    
        try {
            const response = await axios.post(`${apiUrl}/api/add_comment`, commentData);
            if (response.data && response.data.comment_id) {
                // Update the comments in the state
                const { firstname: userFirstName, lastname: userLastName } = JSON.parse(localStorage.getItem("userInfo") || '{}');
                console.log('user_info', localStorage.getItem("user_info"));
                console.log('userFirstName', userFirstName);
                const newCommentData = {
                    id: response.data.comment_id,
                    text: newComment,
                    firstname: userFirstName,
                    lastname: userLastName,
                    user_id: commentData.user_id  // Assuming this is the correct ID
                };
                setComments([...comments, newCommentData]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };
    

    return (
        <div>
            {Array.isArray(comments) && comments.map((comment, index) => (
                <div key={comment.id} id={`comment-${comment.id}`} className="comment">
                    <p><strong>
                        <a href={`/chart/${comment.user_id}`}>
                            {comment.firstname} {comment.lastname}
                        </a>
                        </strong>: {comment.text}
                    </p>
                </div>
            ))}
            <form id="addCommentForm" onSubmit={handleCommentSubmit}>
                <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Add a comment"                    
                    id={`add-comment-${entityType}`} // for test
                />
                <button type="submit">Post</button>
            </form>
        </div>
    );
};

export default Comments;
