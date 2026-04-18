import os
import requests
from urllib.parse import quote
from dotenv import load_dotenv

# ==============================
# LOAD ENV
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# ==============================
# GET KEYS
# ==============================
NEWSDATA_KEY = os.getenv("NEWSDATA_API_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_API_KEY")
GNEWS_KEY = os.getenv("GNEWS_API_KEY")
MEDIASTACK_KEY = os.getenv("MEDIASTACK_API_KEY")

print("\n=== API KEYS CHECK ===")
print("NEWSDATA:", NEWSDATA_KEY)
print("NEWSAPI:", NEWSAPI_KEY)
print("GNEWS:", GNEWS_KEY)
print("MEDIASTACK:", MEDIASTACK_KEY)


# ==============================
# MAIN TEST FUNCTION
# ==============================
def test_all_apis(query):
    print("\n============================")
    print("QUERY:", query)
    print("============================")

    # 🔹 Full query (for strong APIs)
    simple_query = " ".join(query.split()[:3])
    encoded = quote(simple_query)  # for NewsData, NewsAPI, GNews

    # 🔹 Smart keyword extraction (for Mediastack)
    stop_words = {"the", "is", "in", "on", "at", "a", "an", "of", "for", "to", "and"}
    keywords = [w for w in query.lower().split() if w not in stop_words]
    encoded_simple = " ".join(keywords[:3])

    # ==============================
    # SCORES (IMPORTANT)
    # ==============================
    newsdata_score = 0
    newsapi_score = 0
    gnews_score = 0
    mediastack_score = 0

    # ==============================
    # 1. NEWSDATA
    # ==============================
    if NEWSDATA_KEY:
        try:
            url = f"https://newsdata.io/api/1/news?apikey={NEWSDATA_KEY}&q={encoded}"
            r = requests.get(url, timeout=10)

            print("\n[NEWSDATA]")
            print("Status:", r.status_code)

            if r.status_code == 200:
                total = r.json().get("totalResults", 0)
                print("Results:", total)

                if total > 0:
                    newsdata_score = 1
        except Exception as e:
            print("[NEWSDATA ERROR]", e)

    # ==============================
    # 2. NEWSAPI
    # ==============================
    if NEWSAPI_KEY:
        try:
            url = f"https://newsapi.org/v2/everything?q={encoded}&apiKey={NEWSAPI_KEY}&pageSize=1"
            r = requests.get(url, timeout=10)

            print("\n[NEWSAPI]")
            print("Status:", r.status_code)

            if r.status_code == 200:
                total = r.json().get("totalResults", 0)
                print("Results:", total)

                if total > 0:
                    newsapi_score = 1
        except Exception as e:
            print("[NEWSAPI ERROR]", e)

    # ==============================
    # 3. GNEWS
    # ==============================
    if GNEWS_KEY:
        try:
            url = f"https://gnews.io/api/v4/search?q={encoded}&token={GNEWS_KEY}&max=1"
            r = requests.get(url, timeout=10)

            print("\n[GNEWS]")
            print("Status:", r.status_code)

            if r.status_code == 200:
                total = r.json().get("totalArticles", 0)
                print("Results:", total)

                if total > 0:
                    gnews_score = 1
        except Exception as e:
            print("[GNEWS ERROR]", e)

    # ==============================
    # 4. MEDIASTACK (SMART FILTER)
    # ==============================
    if MEDIASTACK_KEY:
        try:
            url = f"https://api.mediastack.com/v1/news?access_key={MEDIASTACK_KEY}&keywords={encoded_simple}"
            r = requests.get(url, timeout=10)

            print("\n[MEDIASTACK]")
            print("Query Used:", simple_query)
            print("Status:", r.status_code)

            if r.status_code == 200:
                total = r.json().get("pagination", {}).get("total", 0)
                print("Results:", total)

                if 0 < total < 5000:
                    mediastack_score = 1

        except Exception as e:
            print("[MEDIASTACK ERROR]", e)

    # ==============================
    # FINAL WEIGHTED SCORE
    # ==============================
    score = (
        newsdata_score * 0.4
        + newsapi_score * 0.2
        + gnews_score * 0.3
        + mediastack_score * 0.1
    )

    score = round(score, 4)

    # ==============================
    # OUTPUT
    # ==============================
    print("\n============================")
    print("NewsData:", newsdata_score)
    print("NewsAPI:", newsapi_score)
    print("GNews:", gnews_score)
    print("Mediastack:", mediastack_score)
    print("FINAL EXTERNAL SCORE:", score)
    print("============================")

    return score


# ==============================
# RUN TEST
# ==============================
if __name__ == "__main__":
    test_all_apis("Australia World Cup 2023")
