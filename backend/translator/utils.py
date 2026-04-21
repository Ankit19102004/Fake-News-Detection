def prepare_news_text(article):
    parts = []

    if article.get("title"):
        parts.append(article["title"])

    if article.get("description"):
        parts.append(article["description"])

    if article.get("content"):
        parts.append(article["content"])

    return " ".join(parts)


def limit_text(text, max_words=300):
    words = text.split()
    return " ".join(words[:max_words])
