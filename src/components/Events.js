import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Events.css';
import { fetchHighResImage } from '../utils/display_utils.js';
import CommentInput from './CommentInput';

const apiUrl = process.env.REACT_APP_FLASK_API_URL;
function EventFeed() {
    const [events, setEvents] = useState([]);

    const fetchCommentsForEvent = async (eventId) => {
        try {
            const response = await axios.get(`${apiUrl}/api/get_comments`, { params: { event_id: eventId } });
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/events`);
                const eventsWithImagesAndComments = await Promise.all(response.data.events.map(async (event) => {
                    const imageUrl = event.event_type === 'first_car_added' ? await fetchHighResImage(event, apiUrl) : null;
                    const comments = await fetchCommentsForEvent(event.event_id);
                    return { ...event, imageUrl, comments };
                }));
                setEvents(eventsWithImagesAndComments);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const handleCommentSubmit = async (eventId, text) => {
        try {
            await axios.post(`${apiUrl}/api/add_comment`, { event_id: eventId, text: text, user_id: localStorage.getItem("user_id") });
            // Update the event's comments in the state
            const updatedEvents = await Promise.all(events.map(async (event) => {
                if (event.event_id === eventId) {
                    const comments = await fetchCommentsForEvent(eventId);
                    return { ...event, comments };
                }
                return event;
            }));
            setEvents(updatedEvents);
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const renderComments = (comments) => {
        return (
            <div className="comments-section">
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <p><strong>{comment.firstname} {comment.lastname}</strong>: {comment.text}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderEvent = (event) => {
        return (
            <div className="event-card">
                {/* Existing event rendering */}
                {getEventContent(event)}
                {renderComments(event.comments)}

                {/* Comment Input */}
                <CommentInput onSubmit={(text) => handleCommentSubmit(event.event_id, text)} />
            </div>
        );
    };

    const getEventContent = (event) => {
        switch (event.event_type) {
            case 'new_user':
                return (
                    <div className="card">
                        <div className="card-body">
                        Welcome <h4 className="card-title"> {event.firstname} {event.lastname} </h4>  
                        {event.profile_picture ? 
                            <img 
                                src={event.profile_picture} 
                                alt={`${event.firstname} ${event.lastname}`} 
                                style={{width:'50px', maxWidth: '350px', height: 'auto', margin: '0 auto', display: 'block' }} 
                            /> 
                            : 
                            <p>No profile pic yet</p>
                        }                    
                        <p>to Cars Of My.Life!</p>
                        </div>
                    </div>
                );
            case 'first_car_added':
                return (
                    <div>
                        <p>{event.firstname} {event.lastname} has added their first car!</p>
                        <p><a href={`/chart/${event.user_id}`}>{event.model_make_id} {event.model_name}</a> Rating: {event.rating}</p>
                        {event.imageUrl ? 
                            <img 
                                src={event.imageUrl} 
                                alt={`${event.car_make} ${event.car_model}`} 
                                style={{ maxWidth: '350px', height: 'auto', margin: '0 auto', display: 'block', width: '100%' }} 
                            /> 
                            : 
                            <p>No image available</p>
                        }
                    </div>
                );
            // Add more cases for other event types
            default:
                return <p>Unhandled event type: {event.event_type}</p>;
        }
    };

    return (
        <div className="event-feed">
            {events.map(event => renderEvent(event))}
        </div>
    );
}

export default EventFeed;

