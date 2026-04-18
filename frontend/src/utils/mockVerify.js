export async function mockVerify(title, text = "", apiKey) {
    if (!apiKey) {
        return { verdict: "ERROR", confidence: 0, error: "Missing API Key" };
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey
            },
            body: JSON.stringify({ title, text })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP Error ${response.status}`);
        }

        const data = await response.json();

        return {
            verdict: data.prediction === "Real News" ? "REAL" : "FAKE",
            confidence: data.confidence,
            final_score: data.final_score,
            external_score: data.external_score,
            conflict_detected: data.conflict_detected,
            original_prediction: data.original_prediction,
            details: data
        };

    } catch (error) {
        console.error("Verification error:", error);
        return {
            verdict: "ERROR",
            confidence: 0,
            error: error.message
        };
    }
}