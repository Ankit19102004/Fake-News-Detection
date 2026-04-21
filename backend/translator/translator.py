from transformers import MarianMTModel, MarianTokenizer
import re


class Translator:
    def __init__(self):
        model_name = "Helsinki-NLP/opus-mt-mul-en"
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name)

    # 🔹 Clean text
    def clean_text(self, text):
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    # 🔹 Split into safe chunks
    def split_text(self, text, max_words=200):
        words = text.split()
        return [
            " ".join(words[i : i + max_words]) for i in range(0, len(words), max_words)
        ]

    # 🔹 Translate single chunk
    def translate_chunk(self, text):
        inputs = self.tokenizer(
            [text], return_tensors="pt", padding=True, truncation=True
        )
        translated = self.model.generate(**inputs)
        return self.tokenizer.batch_decode(translated, skip_special_tokens=True)[0]

    # 🔹 Main translate function (robust)
    def translate(self, text):
        # ✅ Handle list input
        if isinstance(text, list):
            text = " ".join(text)

        if not isinstance(text, str):
            raise ValueError("Input must be string or list of strings")

        text = self.clean_text(text)

        if not text:
            return ""

        # ✅ Short text
        if len(text.split()) <= 200:
            return self.translate_chunk(text)

        # ✅ Long text → chunking
        chunks = self.split_text(text)
        translated_chunks = [self.translate_chunk(chunk) for chunk in chunks]

        return " ".join(translated_chunks)
