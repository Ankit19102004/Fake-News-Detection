from flask import Flask, request, jsonify
from translator import Translator
from utils import prepare_news_text, limit_text

app = Flask(__name__)
translator = Translator()


@app.route("/")
def home():
    return {"message": "Translator API Running 🚀"}


# 🔹 BASIC TEXT TRANSLATION
@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.get_json()

    text = data.get("text", "")

    # Handle list input
    if isinstance(text, list):
        text = " ".join(text)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    translated = translator.translate(text)

    return jsonify({"original": text, "translated": translated})


# 🔹 NEWS TRANSLATION (MAIN FOR YOUR PROJECT)
@app.route("/translate-news", methods=["POST"])
def translate_news():
    article = request.get_json()

    if not article:
        return jsonify({"error": "No article data provided"}), 400

    # Step 1: Extract text safely
    text = prepare_news_text(article)

    if not text:
        return jsonify({"error": "No valid content in article"}), 400

    # Step 2: Limit length (important)
    text = limit_text(text)

    # Step 3: Translate
    translated = translator.translate(text)

    return jsonify({"original": text, "translated": translated})


if __name__ == "__main__":
    app.run(debug=True)
