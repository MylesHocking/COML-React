// CommentInput.js
import React, { useState } from 'react';

function CommentInput({ onSubmit }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea className='textarea' value={text} onChange={(e) => setText(e.target.value)} required></textarea>
            <button className='button' type="submit">Send</button>
        </form>
    );
}

export default CommentInput;
