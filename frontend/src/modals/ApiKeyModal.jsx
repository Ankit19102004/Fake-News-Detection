import { useState } from "react";

export default function ApiKeyModal({ onSave, onClose }) {
    const [key, setKey] = useState("");

    return (
        <div className="modal">
            <input placeholder="Enter API key" onChange={(e) => setKey(e.target.value)} />
            <button onClick={() => onSave(key)}>Save</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
}