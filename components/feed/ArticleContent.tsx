import DOMPurify from "isomorphic-dompurify";

export default function ArticleContent({ article } : { article: any }) {
    const rawContent = article["content:encoded"] || article.content || article.contentSnippet || "";
    const cleanContent = DOMPurify.sanitize(rawContent);

    return (
        <div 
        className="prose prose-invert prose-img:rounded-xl max-w-none text-text-secondary leading-relaxed"
        style={{ contentVisibility: 'auto' , containIntrinsicSize: '1px 5000px'}}
        dangerouslySetInnerHTML={{ __html: cleanContent}}
        />
    )
} 