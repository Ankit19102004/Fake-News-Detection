import { useState } from "react";

export default function AuthModal({ onClose, onSuccess }) {
    const [name, setName] = useState("");

    return (
        <div className="modal">
            <input placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
            <button onClick={() => onSuccess({ name })}>Login</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
}