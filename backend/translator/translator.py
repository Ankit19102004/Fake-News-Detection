import re

import requests


class Translator:
    LANGUAGE_NAMES = {
        "af": "afrikaans",
        "ar": "arabic",
        "bn": "bengali",
        "de": "german",
        "el": "greek",
        "en": "english",
        "es": "spanish",
        "fa": "persian",
        "fr": "french",
        "gu": "gujarati",
        "he": "hebrew",
        "hi": "hindi",
        "id": "indonesian",
        "it": "italian",
        "ja": "japanese",
        "kn": "kannada",
        "ko": "korean",
        "ml": "malayalam",
        "mr": "marathi",
        "ne": "nepali",
        "nl": "dutch",
        "or": "odia",
        "pa": "punjabi",
        "pl": "polish",
        "pt": "portuguese",
        "ru": "russian",
        "ta": "tamil",
        "te": "telugu",
        "th": "thai",
        "tr": "turkish",
        "uk": "ukrainian",
        "ur": "urdu",
        "vi": "vietnamese",
        "zh": "chinese",
        "zh-CN": "chinese",
        "zh-TW": "chinese",
    }

    HINGLISH_MARKERS = {"hai", "kya", "ka", "ki", "ye", "news", "sarkar"}

    def __init__(self):
        pass

    def clean_text(self, text):
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _fetch_google_translation_data(self, text):
        try:
            res = requests.get(
                "https://translate.googleapis.com/translate_a/single",
                params={
                    "client": "gtx",
                    "sl": "auto",
                    "tl": "en",
                    "dt": "t",
                    "q": text,
                },
                timeout=8,
            )
            if res.status_code != 200:
                return None
            return res.json()
        except Exception as e:
            print(f"[TRANSLATION ERROR] {e}")
            return None

    def _extract_language_code(self, data):
        if isinstance(data, list) and len(data) > 2 and isinstance(data[2], str):
            return data[2]
        return None

    def _script_language_fallback(self, text):
        if re.search(r"[\u0980-\u09FF]", text):
            return "bengali"
        if re.search(r"[\u0B80-\u0BFF]", text):
            return "tamil"
        if re.search(r"[\u0C00-\u0C7F]", text):
            return "telugu"
        if re.search(r"[\u0C80-\u0CFF]", text):
            return "kannada"
        if re.search(r"[\u0D00-\u0D7F]", text):
            return "malayalam"
        if re.search(r"[\u0A80-\u0AFF]", text):
            return "gujarati"
        if re.search(r"[\u0A00-\u0A7F]", text):
            return "punjabi"
        if re.search(r"[\u0900-\u097F]", text):
            return "hindi"
        if re.search(r"[\u0B00-\u0B7F]", text):
            return "odia"
        if re.search(r"[\u0600-\u06FF]", text):
            return "arabic"
        if re.search(r"[\u0400-\u04FF]", text):
            return "russian"
        if re.search(r"[\u0370-\u03FF]", text):
            return "greek"
        if re.search(r"[\u0E00-\u0E7F]", text):
            return "thai"
        if re.search(r"[\uAC00-\uD7AF]", text):
            return "korean"
        if re.search(r"[\u3040-\u30FF]", text):
            return "japanese"
        if re.search(r"[\u4E00-\u9FFF]", text):
            return "chinese"
        return "english" if text.isascii() else "non-english"

    def detect_language(self, text):
        if isinstance(text, list):
            text = " ".join(text)

        if not isinstance(text, str):
            raise ValueError("Input must be string or list")

        text = self.clean_text(text)
        if not text:
            return "english"

        words = text.lower().split()
        if text.isascii() and sum(1 for word in words if word in self.HINGLISH_MARKERS) >= 2:
            return "hinglish"

        data = self._fetch_google_translation_data(text)
        code = self._extract_language_code(data)
        if code:
            return self.LANGUAGE_NAMES.get(code, code.lower())

        return self._script_language_fallback(text)

    def needs_translation(self, text):
        if not text:
            return False
        return self.detect_language(text) != "english"

    def split_text(self, text, max_words=200):
        words = text.split()
        return [
            " ".join(words[i : i + max_words]) for i in range(0, len(words), max_words)
        ]

    def translate_chunk(self, text):
        data = self._fetch_google_translation_data(text)
        if not data:
            return text

        translated = "".join(part[0] for part in data[0] if isinstance(part, list))
        return translated.strip()

    def translate(self, text):
        if isinstance(text, list):
            text = " ".join(text)

        if not isinstance(text, str):
            raise ValueError("Input must be string or list")

        text = self.clean_text(text)
        if not text:
            return ""

        if not self.needs_translation(text):
            return text

        if len(text.split()) <= 200:
            return self.translate_chunk(text)

        chunks = self.split_text(text)
        translated_chunks = [self.translate_chunk(chunk) for chunk in chunks]
        return " ".join(translated_chunks)
