import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Remove truncated newsapi / tags like [+1234 chars]
    text = re.sub(r'\[\+\d+\s*chars\]', '', text)
    # Remove excess whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def scrape_url(url: str) -> str:
    """Fetch raw HTML and parse out the main text density."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        }
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code != 200:
            return ""
        
        soup = BeautifulSoup(res.content, 'html.parser')
        
        # Strip noisy elements
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'button', 'iframe']):
            tag.decompose()

        paragraphs = soup.find_all('p')
        content_chunks = []
        
        for p in paragraphs:
            text = p.get_text(strip=True)
            # Filter out very short UI links or cookie banners
            if len(text) > 50:
                content_chunks.append(text)
                
        return "\n\n".join(content_chunks)
    except Exception as e:
        print(f"[Scraper Error] {e}")
        return ""

def fetch_full_article(title: str, description: str = "", url: str = "") -> dict:
    """Implement exact steps requested by user."""
    NEWSDATA_KEY = os.getenv("NEWSDATA_API_KEY")
    GNEWS_KEY = os.getenv("GNEWS_API_KEY")
    MEDIASTACK_KEY = os.getenv("MEDIASTACK_API_KEY")

    encoded_title = quote(title)
    
    full_content = ""
    source_used = []
    
    # 1. NEWSDATA
    if not full_content and NEWSDATA_KEY:
        try:
            r = requests.get(f"https://newsdata.io/api/1/news?apikey={NEWSDATA_KEY}&q={encoded_title}", timeout=5)
            if r.status_code == 200:
                data = r.json().get("results", [])
                if data:
                    content = data[0].get("content") or data[0].get("description") or ""
                    clean_c = clean_text(content)
                    if len(clean_c) > 200:
                        full_content = clean_c
                        source_used.append("NewsData")
        except Exception:
            pass

    # 2. GNEWS
    if len(full_content) < 300 and GNEWS_KEY:
        try:
            r = requests.get(f"https://gnews.io/api/v4/search?q={encoded_title}&token={GNEWS_KEY}&max=1", timeout=5)
            if r.status_code == 200:
                data = r.json().get("articles", [])
                if data:
                    content = data[0].get("content") or data[0].get("description") or ""
                    clean_c = clean_text(content)
                    if len(clean_c) > len(full_content):
                        full_content = clean_c
                        source_used = ["GNews"]
        except Exception:
            pass

    # 3. MEDIASTACK
    if len(full_content) < 300 and MEDIASTACK_KEY:
        try:
            r = requests.get(f"https://api.mediastack.com/v1/news?access_key={MEDIASTACK_KEY}&keywords={encoded_title}&limit=1", timeout=5)
            if r.status_code == 200:
                data = r.json().get("data", [])
                if data:
                    content = data[0].get("description") or ""
                    clean_c = clean_text(content)
                    if len(clean_c) > len(full_content):
                        full_content = clean_c
                        source_used = ["Mediastack"]
        except Exception:
            pass

    # 4. URL SCRAPING
    # The ultimate weapon for full text. If we got an article webpage, scrape it!
    if url:
        scraped_content = scrape_url(url)
        # If the scraped content has substantial length, it trumps all API shorts.
        if len(scraped_content) > 400:
            full_content = scraped_content
            source_used = ["BeautifulSoup Scraper"]
            
    # Fallbacks and Cleanups
    if not full_content:
        full_content = clean_text(description)
        if full_content:
            source_used = ["Provided Summary (Fallback)"]
            
    confidence = "low"
    if len(full_content) > 1000:
        confidence = "high"
    elif len(full_content) > 300:
        confidence = "medium"
        
    if not full_content or len(full_content) < 50:
         full_content = "Full article content is behind a firewall or could not be cleanly extracted from the provided sources. Please visit the original URL to read the entire publication."

    summary = clean_text(description)
    if not summary and len(full_content) > 200:
        summary = full_content[:197] + "..."

    return {
        "title": title,
        "full_content": full_content,
        "summary": summary,
        "source": "Data-Fetching Assistant", 
        "confidence": confidence,
        "sources_used": source_used
    }
