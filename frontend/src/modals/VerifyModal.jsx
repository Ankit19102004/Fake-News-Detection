import { useEffect, useState } from "react";
import { mockVerify } from "../utils/mockVerify";
import { useAuth } from "../context/AuthContext";

export default function VerifyModal({ article, onClose }) {
    const [result, setResult] = useState(null);
    const { apiKey } = useAuth();

    useEffect(() => {
        mockVerify(article.title, article.text || article.description || "", apiKey).then(setResult);
    }, [article, apiKey]);

    return (
        <div className="modal flex flex-col gap-4">
            {!result ? "Checking..." : result.verdict === "ERROR" ? `Error: ${result.error}` : `${result.verdict} (${result.confidence}%)`}
            <button className="bg-black text-white px-4 py-2 mt-4" onClick={onClose}>Close</button>
        </div>
    );
}