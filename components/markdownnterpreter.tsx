export const parseMarkdown = (text:string) => {
    let html = text;

    // Headers (H1-H6)
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

    // Horizontal separators
    html = html.replace(/^---$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
    
    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="language-${lang || 'text'}"><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Bullet lists
    html = html.replace(/^\- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.*)$/gm, '<li class="numbered">$1</li>');

    // Checkboxes
    html = html.replace(/- \[x\] (.*)$/gm, '<li class="task completed">✅ $1</li>');
    html = html.replace(/- \[ \] (.*)$/gm, '<li class="task">☐ $1</li>');

    // Paragraphs
    html = html.split('\n\n').map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph && 
          !paragraph.startsWith('<h') && 
          !paragraph.startsWith('<ul') && 
          !paragraph.startsWith('<ol') && 
          !paragraph.startsWith('<pre') && 
          !paragraph.startsWith('<blockquote') && 
          !paragraph.startsWith('<hr') &&
          !paragraph.startsWith('<li')) {
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph;
    }).join('\n\n');

    return html;
  };