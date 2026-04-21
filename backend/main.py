import pickle, json, uuid, re, traceback, nltk  # noqa: E401
import numpy as np
import torch
import torch.nn as nn
import requests
from urllib.parse import quote
import xml.etree.ElementTree as ET
from datetime import datetime

from flask import Flask, request, jsonify

from dotenv import load_dotenv
from archive import get_explore_news
from scraper import fetch_full_article, extract_metadata_from_url
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from transformers import (
    AutoModel,
    AutoTokenizer,
    AutoModelForSequenceClassification,
    BertTokenizerFast,
)

import sys
import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import warnings

torch.set_num_threads(1)
torch.set_grad_enabled(False)

warnings.filterwarnings("ignore")
sys.modules["tensorflow"] = None
sys.modules["tensorflow.keras"] = None
sys.modules["keras"] = None


# ==============================
# APP INIT
# ==============================
load_dotenv()
app = Flask(__name__)


@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = (
        "Content-Type, Authorization, X-API-KEY"
    )
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
    return response


device = torch.device("cpu")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
API_KEYS_FILE = "api_keys.json"

# ==============================
# NLTK
# ==============================
try:
    nltk.download("stopwords", quiet=True)
    all_stopwords = stopwords.words("english")
except Exception:
    all_stopwords = []

ps = PorterStemmer()

# ==============================
# EXTERNAL API KEYS
# ==============================
NEWSDATA_KEY = os.getenv("NEWSDATA_API_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_API_KEY")
GNEWS_KEY = os.getenv("GNEWS_API_KEY")
MEDIASTACK_KEY = os.getenv("MEDIASTACK_API_KEY")


# ==============================
# API KEY MANAGEMENT
# ==============================


def load_truthx_api_keys() -> dict:
    if os.path.exists(API_KEYS_FILE):
        with open(API_KEYS_FILE, "r") as f:
            try:
                return json.load(f)
            except Exception:
                return {}
    return {}


def save_truthx_api_keys(keys: dict) -> None:
    try:
        with open(API_KEYS_FILE, "w") as f:
            json.dump(keys, f)
    except Exception as e:
        print(f"[ERROR] Saving API keys: {e}")


def verify_api_key(key: str) -> bool:
    return key in truthx_api_keys


truthx_api_keys = load_truthx_api_keys()


# ==============================
# TEXT PREPROCESSING
# ==============================


def preprocess_text(text: str) -> str:
    """Lowercase, remove non-alpha, strip stopwords, stem."""
    tokens = re.sub("[^a-zA-Z]", " ", text).lower().split()
    return " ".join(ps.stem(w) for w in tokens if w not in all_stopwords)


# ==============================
# PAD SEQUENCES
# ==============================


def pad_sequences(sequences: list, maxlen: int, padding: str = "pre") -> np.ndarray:

    result = []
    for seq in sequences:
        seq = list(seq)
        if len(seq) >= maxlen:
            seq = seq[-maxlen:]
        else:
            pad = [0] * (maxlen - len(seq))
            seq = (pad + seq) if padding == "pre" else (seq + pad)
        result.append(seq)
    return np.array(result, dtype=np.int32)


# ==============================
# EXTERNAL NEWS VERIFICATION
# ==============================


def check_external_news(query: str) -> float:
    """Improved external verification with weighted scoring + Google RSS"""

    if not query:
        return 0.0

    # 🔹 Full query
    encoded = quote(query)

    # 🔹 Smart keyword extraction (for Mediastack + Google)
    stop_words = {"the", "is", "in", "on", "at", "a", "an", "of", "for", "to", "and"}
    keywords = [w for w in query.lower().split() if w not in stop_words]
    simple_query = " ".join(keywords[:3])
    encoded_simple = quote(simple_query)

    # =========================
    # SCORES
    # =========================
    newsdata = 0
    newsapi = 0
    gnews = 0
    mediastack = 0
    google = 0

    # =========================
    # 1. NEWSDATA
    # =========================
    try:
        r = requests.get(
            f"https://newsdata.io/api/1/news?apikey={NEWSDATA_KEY}&q={encoded}",
            timeout=5,
        )
        if r.status_code == 200 and r.json().get("totalResults", 0) > 0:
            newsdata = 1
    except Exception:
        pass

    # =========================
    # 2. NEWSAPI
    # =========================
    try:
        r = requests.get(
            f"https://newsapi.org/v2/everything?q={encoded}&apiKey={NEWSAPI_KEY}&pageSize=1",
            timeout=5,
        )
        if r.status_code == 200 and r.json().get("totalResults", 0) > 0:
            newsapi = 1
    except Exception:
        pass

    # =========================
    # 3. GNEWS
    # =========================
    try:
        r = requests.get(
            f"https://gnews.io/api/v4/search?q={encoded}&token={GNEWS_KEY}&max=1",
            timeout=5,
        )
        if r.status_code == 200 and r.json().get("totalArticles", 0) > 0:
            gnews = 1
    except Exception:
        pass

    # =========================
    # 4. MEDIASTACK (FIXED)
    # =========================
    try:
        r = requests.get(
            f"https://api.mediastack.com/v1/news?access_key={MEDIASTACK_KEY}&keywords={encoded_simple}&limit=1",
            timeout=5,
        )
        total = r.json().get("pagination", {}).get("total", 0)

        # 🔥 Ignore noisy results
        if r.status_code == 200 and 0 < total < 5000:
            mediastack = 1
    except Exception:
        pass

    # =========================
    # 5. GOOGLE NEWS RSS ⭐
    # =========================
    try:
        r = requests.get(
            f"https://news.google.com/rss/search?q={encoded_simple}",
            timeout=5,
        )
        root = ET.fromstring(r.content)
        items = root.findall(".//item")

        if len(items) > 0:
            google = 1
    except Exception:
        pass

    # =========================
    # FINAL WEIGHTED SCORE
    # =========================
    score = (
        newsdata * 0.35
        + newsapi * 0.15
        + gnews * 0.25
        + mediastack * 0.05
        + google * 0.2
    )

    return round(score, 4)


# ======================================================
# MODEL 1 — NLP (TF-IDF + SVM)
# ======================================================

try:
    nlp_model = pickle.load(
        open(os.path.join(BASE_DIR, "model", "NLP", "model2.pkl"), "rb")
    )
    nlp_vector = pickle.load(
        open(os.path.join(BASE_DIR, "model", "NLP", "tfidfvect2.pkl"), "rb")
    )
    print(f"[OK] NLP model loaded ({1 if nlp_model else 0})")
except Exception as e:
    nlp_model = nlp_vector = None
    print(f"[WARN] NLP model not loaded: {e}")


def predict_nlp(text: str) -> list:
    if not nlp_model or not nlp_vector:
        return []
    vec = nlp_vector.transform([preprocess_text(text)])
    pred = nlp_model.predict(vec)[0]
    decision = nlp_model.decision_function(vec)[0]
    conf = 1 / (1 + np.exp(-abs(decision)))
    return [("Real News" if pred == 1 else "Fake News", float(conf))]


# ======================================================
# MODEL 2 — HYBRID
# ======================================================


class HybridModel(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int = 256):
        super().__init__()
        # No padding_idx — training notebook used plain nn.Embedding
        self.embedding = nn.Embedding(vocab_size, embed_dim)

        # kernel_size=5 with NO padding → output length = input_len - 4
        self.conv = nn.Conv1d(embed_dim, 256, kernel_size=5)
        self.pool = nn.MaxPool1d(2)

        # Bidirectional LSTM: output dim = 128 * 2 = 256
        self.lstm = nn.LSTM(256, 128, batch_first=True, bidirectional=True)

        self.fc1 = nn.Linear(256, 128)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(128, 2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.embedding(x)
        x = x.permute(0, 2, 1)

        x = torch.relu(self.conv(x))
        x = self.pool(x)

        x = x.permute(0, 2, 1)
        x, _ = self.lstm(x)

        x = x[:, -1, :]

        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        return self.fc2(x)


# ======================================================
# MODEL 2 — HYBRID
# ======================================================


class HybridModel_A(nn.Module):
    """CNN → MaxPool → BiLSTM (your original correct model)"""

    def __init__(self, vocab_size: int, embed_dim: int = 256):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)

        self.conv = nn.Conv1d(embed_dim, 256, kernel_size=5)
        self.pool = nn.MaxPool1d(2)

        self.lstm = nn.LSTM(256, 128, batch_first=True, bidirectional=True)

        self.fc1 = nn.Linear(256, 128)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(128, 2)

    def forward(self, x):
        x = self.embedding(x)
        x = x.permute(0, 2, 1)

        x = torch.relu(self.conv(x))
        x = self.pool(x)

        x = x.permute(0, 2, 1)
        x, _ = self.lstm(x)

        x = x[:, -1, :]

        x = torch.relu(self.fc1(x))
        x = self.dropout(x)

        return self.fc2(x)


class HybridModel_B(nn.Module):
    """CNN + LSTM PARALLEL (second file model)"""

    def __init__(self, vocab_size: int, embed_dim: int = 256):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)

        self.conv = nn.Conv1d(embed_dim, 256, kernel_size=5)
        self.lstm = nn.LSTM(256, 128, batch_first=True, bidirectional=True)

        self.fc1 = nn.Linear(256, 128)
        self.fc2 = nn.Linear(128, 2)

    def forward(self, x):
        x_embed = self.embedding(x)

        # CNN branch
        x_cnn = torch.relu(self.conv(x_embed.permute(0, 2, 1)))
        x_cnn = torch.max(x_cnn, dim=2)[0]

        # LSTM branch
        x_lstm, _ = self.lstm(x_embed)
        x_lstm = x_lstm[:, -1, :]

        x = x_cnn + x_lstm

        x = torch.relu(self.fc1(x))
        return self.fc2(x)


# ======================================================
# SAFE TOKENIZER
# ======================================================


def safe_load_tokenizer(path):
    try:
        return pickle.load(open(path, "rb"))
    except Exception as e:
        print(f"[TOKENIZER ERROR] {e}")
        print("[FIX] Using fallback tokenizer (reduced accuracy)")

        class SimpleTokenizer:
            def texts_to_sequences(self, texts):
                return [[1] * len(t.split()) for t in texts]

        return SimpleTokenizer()


# ======================================================
# MODEL 2 — HYBRID (FIXED)
# ======================================================


class HybridEnsemble:
    DIRS = [
        (os.path.join(BASE_DIR, "model", "HYBRID"), HybridModel_A),
        (os.path.join(BASE_DIR, "model", "HYBRID_"), HybridModel_B),
    ]

    def __init__(self):
        self.models = []
        self.tokenizers = []
        self.max_lens = []

        print("[HYBRID] Loading models...")
        self._load_all()
        print(f"[OK] Hybrid models loaded ({len(self.models)})")

    def _load_all(self):
        for path, model_class in self.DIRS:
            try:
                tok_path, cfg_path, model_path = None, None, None

                for f in os.listdir(path):
                    f_lower = f.lower()

                    if "tokenizer" in f_lower:
                        tok_path = os.path.join(path, f)
                    elif "config" in f_lower:
                        cfg_path = os.path.join(path, f)
                    elif "hybrid_model" in f_lower:
                        model_path = os.path.join(path, f)

                if not tok_path or not cfg_path or not model_path:
                    continue

                try:
                    tok_data = pickle.load(open(tok_path, "rb"))

                    if isinstance(tok_data, dict) and "word_index" in tok_data:

                        class CleanTokenizer:
                            def __init__(self, word_index):
                                self.word_index = word_index

                            def texts_to_sequences(self, texts):
                                return [
                                    [self.word_index.get(w, 0) for w in text.split()]
                                    for text in texts
                                ]

                        tok = CleanTokenizer(tok_data["word_index"])
                    else:
                        raise Exception()

                except Exception:

                    class SimpleTokenizer:
                        def texts_to_sequences(self, texts):
                            return [[1] * len(t.split()) for t in texts]

                    tok = SimpleTokenizer()

                cfg = pickle.load(open(cfg_path, "rb"))
                vocab_size = cfg.get("max_words") or cfg.get("vocab_size")
                max_len = cfg.get("max_len")

                if not vocab_size or not max_len:
                    continue

                model = model_class(vocab_size).to(device)
                model.load_state_dict(
                    torch.load(model_path, map_location=device, weights_only=True)
                )
                model.eval()

                self.models.append(model)
                self.tokenizers.append(tok)
                self.max_lens.append(max_len)

                print("[OK] Hybrid model loaded")

            except Exception:
                continue

    def predict(self, text: str) -> list:
        if not self.models:
            return []

        results = []

        for model, tok, max_len in zip(self.models, self.tokenizers, self.max_lens):
            try:
                seq = tok.texts_to_sequences([text])
                padded = pad_sequences(seq, maxlen=max_len, padding="pre")

                x = torch.tensor(padded, dtype=torch.long).to(device)

                with torch.no_grad():
                    probs = torch.softmax(model(x), dim=1)

                conf, pred = torch.max(probs, dim=1)
                label = "Real News" if pred.item() == 1 else "Fake News"

                results.append((label, float(conf.item())))

            except Exception:
                continue

        return results


hybrid_ensemble = None


def get_hybrid():
    global hybrid_ensemble
    if hybrid_ensemble is None:
        print("[HYBRID] Lazy loading...")
        hybrid_ensemble = HybridEnsemble()
    return hybrid_ensemble


def predict_hybrid(text: str) -> list:
    return get_hybrid().predict(text)


# ======================================================
# MODEL 3 — NAIVE (Naive Bayes / Passive-Aggressive)
# ======================================================

_naive_paths = [
    os.path.join(BASE_DIR, "model", "NAIVE_", "nb_tfidf.pkl"),
    os.path.join(BASE_DIR, "model", "NAIVE_", "nb_count.pkl"),
    os.path.join(BASE_DIR, "model", "NAIVE_", "passive_aggressive.pkl"),
    os.path.join(BASE_DIR, "model", "NAIVE_", "best_passive_aggressive.pkl"),
]
naive_models = []
for _p in _naive_paths:
    try:
        naive_models.append(pickle.load(open(_p, "rb")))
    except Exception:
        pass
print(f"[OK] Naive models loaded ({len(naive_models)})")


def predict_naive(text: str) -> list:
    results = []
    for model in naive_models:
        try:
            probs = model.predict_proba([text])[0]
            pred, conf = int(np.argmax(probs)), float(probs.max())
        except Exception:
            d = model.decision_function([text])[0]
            pred = 1 if d > 0 else 0
            conf = 1 / (1 + np.exp(-abs(d)))
        results.append(("Fake News" if pred == 0 else "Real News", float(conf)))
    return results


# ======================================================
# MODEL 4 — BERT
# ======================================================

bert_tokenizer = BertTokenizerFast.from_pretrained("bert-base-uncased")
_bert_base = AutoModel.from_pretrained("bert-base-uncased").to(device)
print("[OK] BERT base loaded")


class BERT_Arch(nn.Module):
    def __init__(self, bert):
        super().__init__()
        self.bert = bert
        self.fc1 = nn.Linear(768, 512)
        self.fc2 = nn.Linear(512, 2)

    def forward(self, sent_id, mask):
        x = self.bert(sent_id, attention_mask=mask)["pooler_output"]
        return self.fc2(self.fc1(x))


def _load_bert_ckpt(path: str) -> BERT_Arch:
    model = BERT_Arch(_bert_base)
    if os.path.exists(path):
        model.load_state_dict(torch.load(path, map_location=device, weights_only=False))
    model.eval()
    return model


bert_models = None


def get_bert_models():
    global bert_models
    if bert_models is None:
        print("[BERT] Lazy loading...")
        bert_models = [
            _load_bert_ckpt(os.path.join(BASE_DIR, "model", "BERT", "bert_model.pt")),
            _load_bert_ckpt(os.path.join(BASE_DIR, "model", "BERT", "best_model.pt")),
            _load_bert_ckpt(
                os.path.join(BASE_DIR, "model", "BERT", "c2_new_model_weights.pt")
            ),
        ]
        print(f"[OK] BERT loaded ({len(bert_models)})")
    return bert_models


# print(f"[OK] BERT checkpoints loaded ({len(bert_models)})")


def predict_bert(text: str) -> list:
    tokens = bert_tokenizer(
        [text],
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt",
    )
    tokens = {k: v.to(device) for k, v in tokens.items()}

    results = []
    for model in get_bert_models():
        with torch.no_grad():
            out = model(tokens["input_ids"], tokens["attention_mask"])
        probs = torch.softmax(out, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        conf = probs.max().item()
        # Training convention: 1 = Fake News, 0 = Real News
        results.append(("Fake News" if pred == 1 else "Real News", float(conf)))
    return results


# ======================================================
# MODEL 5 — DISTILBERT (HuggingFace fine-tuned)
# ======================================================

distil_model = None
distil_tokenizer = None


def get_distil():
    global distil_model, distil_tokenizer
    if distil_model is None:
        print("[DISTIL] Lazy loading...")
        path = os.path.join(BASE_DIR, "model", "DISTILBERT", "distilbert_model")

        distil_tokenizer = AutoTokenizer.from_pretrained(path)
        distil_model = AutoModelForSequenceClassification.from_pretrained(path).to(
            device
        )

        distil_model.eval()
        print(f"[OK] DistilBERT loaded ({1 if distil_model else 0})")

    return distil_model, distil_tokenizer


def predict_distil(text: str) -> list:
    try:
        model, tokenizer = get_distil()

        inputs = tokenizer(
            text, return_tensors="pt", truncation=True, padding=True, max_length=256
        )

        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            out = model(**inputs)

        probs = torch.softmax(out.logits, dim=1)
        conf, pred = torch.max(probs, dim=1)

        return [("Real News" if pred.item() == 1 else "Fake News", float(conf.item()))]

    except Exception:
        return []


# ======================================================
# ENSEMBLE FUSION
# ======================================================


def final_ensemble(all_results: list) -> tuple:
    """Sum confidence scores per label; highest total wins."""
    fake = sum(c for l, c in all_results if "Fake" in l)  # noqa: E741
    real = sum(c for l, c in all_results if "Real" in l)  # noqa: E741
    total = fake + real
    if total == 0:
        return "Real News", 0.5
    label = "Fake News" if fake > real else "Real News"
    return label, round(max(fake, real) / total, 4)


def format_output(raw: dict) -> dict:
    return {
        k: [{"prediction": l, "confidence": round(c, 4)} for l, c in v]  # noqa: E741
        for k, v in raw.items()
    }


# ======================================================
# 🔥 CONFLICT RESOLUTION SYSTEM
# ======================================================


def detect_conflict(final_label, model_conf, ext_score):
    if final_label == "Fake News" and ext_score > 0.75:
        return "external_strong_real"

    if final_label == "Real News" and ext_score < 0.25:
        return "external_strong_fake"

    return "no_conflict"


def resolve_conflict(final_label, model_conf, ext_score):
    conflict = detect_conflict(final_label, model_conf, ext_score)

    # External strongly supports REAL
    if conflict == "external_strong_real":
        if model_conf < 0.85:
            return "Uncertain (Likely Real)", True

    # External strongly supports FAKE
    if conflict == "external_strong_fake":
        if model_conf < 0.85:
            return "Uncertain (Likely Fake)", True

    return final_label, False


# ======================================================
# ROUTES
# ======================================================


@app.route("/", methods=["GET"])
def index():
    return jsonify(
        {
            "message": "Welcome to TruthX API",
            "endpoints": {
                "POST /generate_key": "Get a new API key",
                "POST /verify": "Verify news (requires X-API-KEY header)",
                "GET  /test_hybrid": "Check how many hybrid models are loaded",
            },
        }
    )


@app.route("/test_hybrid", methods=["GET"])
def test_hybrid():
    return jsonify(
        {
            "hybrid_models_loaded": len(hybrid_ensemble.models),
            "configs": [
                {"max_len": ml, "vocab_size": tok.num_words}
                for tok, ml in zip(hybrid_ensemble.tokenizers, hybrid_ensemble.max_lens)
            ],
        }
    )


@app.route("/generate_key", methods=["POST"])
def generate_key():
    body = request.json if isinstance(request.json, dict) else {}
    user_id = body.get("user_id", "anonymous")

    # 🔥 Check if user already has a key
    for key, uid in truthx_api_keys.items():
        if uid == user_id:
            return jsonify(
                {
                    "status": "success",
                    "api_key": key,
                    "message": "Existing API key returned",
                }
            )

    # 🔥 Else create new
    new_key = str(uuid.uuid4())
    truthx_api_keys[new_key] = user_id
    save_truthx_api_keys(truthx_api_keys)

    return jsonify(
        {"status": "success", "api_key": new_key, "message": "New API key generated"}
    )


@app.route("/verify", methods=["POST"])
def verify():
    try:
        api_key = request.headers.get("X-API-KEY")
        if not verify_api_key(api_key):
            return jsonify(
                {"error": "Invalid or missing API key. Use /generate_key"}
            ), 401

        data = request.get_json(silent=True)
        if not data or "text" not in data:
            return jsonify({"error": "Provide 'text' in request body"}), 400

        text = data["text"].strip()
        external = data.get("title", text[:100])
        title = data.get("title", text)

        if not text:
            return jsonify({"error": "Empty text"}), 400

        full_doc = f"{title} {text}".strip()

        # Safe wrapper
        def safe(fn):
            try:
                return fn(full_doc)
            except Exception as e:
                print(f"[MODEL ERROR] {fn.__name__}: {e}")
                return []

        # 🔥 Model predictions
        raw = {
            "nlp": safe(predict_nlp),
            "hybrid": safe(predict_hybrid),
            "naive": safe(predict_naive),
            "bert": safe(predict_bert),
            "distilbert": safe(predict_distil),
        }

        # 🔥 Ensemble decision
        all_preds = [p for preds in raw.values() for p in preds]
        final_label, model_conf = final_ensemble(all_preds)

        # 🔥 External verification
        ext_score = check_external_news(external)

        # 🔥 Conflict resolution
        resolved_label, conflict_flag = resolve_conflict(
            final_label, model_conf, ext_score
        )

        # 🔥 Final score (65:35)
        final_score = model_conf * 0.65 + ext_score * 0.35

        # 🔥 Penalize if conflict
        if conflict_flag:
            final_score *= 0.85

        final_accuracy = round(final_score * 100, 2)

        return jsonify(
            {
                "title": title,
                # Final result
                "prediction_final": resolved_label,
                "prediction_original": final_label,
                # Scores
                "confidence": round(model_conf, 4),
                "external_score": round(ext_score, 4),
                "final_score": round(final_score, 4),
                "accuracy": f"{final_accuracy}%",
                # Conflict info
                "conflict_detected": conflict_flag,
                "message": (
                    "External sources strongly contradict model prediction"
                    if conflict_flag
                    else "No conflict detected"
                ),
                # Model breakdown
                "models": format_output(raw),
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/fetch_article", methods=["POST"])
def fetch_article():
    body = request.json if isinstance(request.json, dict) else {}
    title = body.get("title", "")
    description = body.get("description", "")
    url = body.get("url", "")
    
    if not title and url:
        metadata = extract_metadata_from_url(url)
        title = metadata.get("title", "Scraped Article from URL")
        description = metadata.get("description", "")
        
    if not title:
        return jsonify({"error": "Title or URL is required"}), 400
        
    try:
        result = fetch_full_article(title, description, url)
        # Pass back metadata if they only provided URL
        if not body.get("title") and url:
            result["scraped_metadata"] = metadata
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/extract_metadata", methods=["POST"])
def extract_metadata():
    body = request.json if isinstance(request.json, dict) else {}
    url = body.get("url", "")
    if not url:
        return jsonify({"error": "URL is required"}), 400
    try:
        metadata = extract_metadata_from_url(url)
        return jsonify(metadata)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/explore_news", methods=["GET"])
def explore_news():
    current_year = datetime.utcnow().year
    year = request.args.get("year", type=int) or current_year
    limit = request.args.get("limit", default=18, type=int) or 18
    limit = max(1, min(limit, 50))

    articles, message = get_explore_news(year, limit)

    return jsonify(
        {
            "status": "success",
            "year": year,
            "count": len(articles),
            "message": message,
            "articles": articles,
        }
    )

# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
