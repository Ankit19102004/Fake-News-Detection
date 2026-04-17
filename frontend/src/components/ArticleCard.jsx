export default function ArticleCard({ article, onVerify }) {
    return (
        <div className="card">
            <img src={article.image} />
            <h3>{article.title}</h3>

            <button onClick={() => onVerify(article)}>Verify</button>
        </div>
    );
}