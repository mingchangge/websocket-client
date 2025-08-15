import Quill from 'quill';

// 1. 自定义代码块容器 Blot
const BlockBlot = Quill.import('blots/block')
class CodeBlockBlot extends BlockBlot {
    static create() {
        const node = super.create() // 复用父类创建逻辑
        node.classList.add('code-block')
        node.setAttribute('data-quill-type', 'code-block') // 增加标识，便于匹配
        return node
    }

    // 严格匹配：只识别带特定类名和属性的 div
    static matches(node) {
        return (
            node.tagName === 'DIV' &&
            node.classList.contains('code-block') &&
            node.hasAttribute('data-quill-type') &&
            node.getAttribute('data-quill-type') === 'code-block' &&
            !node.closest('.code-block') // 禁止嵌套
        )
    }

    // 确保内容导出时保留原始结构
    static value(node) {
        return {
            type: 'code-block',
            content: node.innerHTML
        }
    }
}
CodeBlockBlot.blotName = 'code-block'
CodeBlockBlot.tagName = 'DIV'
CodeBlockBlot.className = 'code-block' // 明确关联类名
Quill.register(CodeBlockBlot, true)

// 2. 自定义代码内容 Blot（嵌套在 code-block 中）
class CodeContentBlot extends BlockBlot {
    static create() {
        const node = super.create()
        node.classList.add('code-content')
        node.style.whiteSpace = 'pre-wrap'
        return node
    }

    // 仅匹配 code-block 内部的 code-content
    static matches(node) {
        return (
            node.tagName === 'P' &&
            node.classList.contains('code-content') &&
            node.parentElement?.classList.contains('code-block')
        )
    }
}
CodeContentBlot.blotName = 'code-content'
CodeContentBlot.tagName = 'P'
CodeContentBlot.className = 'code-content'
Quill.register(CodeContentBlot, true)

// 定义原子代码块 Embed blot
const BlockEmbed = Quill.import('blots/block/embed')
class CodeBlockEmbed extends BlockEmbed {
    static create(value) {
        const node = super.create()
        node.classList.add('code-block')
        node.setAttribute('data-quill-type', 'code-block')
        /* 
        // 方案一：生成一个p标签，使用white-space: pre-wrap;，浏览器会把换行符 \n 当成真正的换行来渲染
       
        const content = document.createElement('p')
        content.classList.add('code-content')
        // 保持原始格式
        content.style.whiteSpace = 'pre-wrap'
        content.textContent = value || ''
        node.appendChild(content)
        */
        /* 
        * // 方案二：正确实现
        * // 1. 按 \n 拆成行
        * // 2. 每行一个 <p class="code-content">
        * // 3. 每行内容作为 p 的 textContent
        */
        const lines = (value || '').split('\n');

        // 2. 每行一个 <p class="code-content">
        lines.forEach(text => {
            const p = document.createElement('p');
            p.classList.add('code-content');
            // 不需要 white-space: pre-wrap;
            p.textContent = text;
            node.appendChild(p);
        });

        return node
    }

    static value(domNode) {
        return domNode.querySelector('.code-content')?.textContent || ''
    }
}
CodeBlockEmbed.blotName = 'code-block-embed'
CodeBlockEmbed.tagName = 'DIV'
Quill.register(CodeBlockEmbed)

// 3. 自定义HTML处理器
export class HtmlProcessor {
    // 净化HTML：保留自定义结构，移除危险标签
    static sanitize(html) {
        return (
            html
                // 1. 移除危险标签（script/style/iframe）
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<style[^>]*>.*?<\/style>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                // 2. 为自定义元素添加保留标识（确保不被过滤）
                .replace(
                    /<div class="code-block"/gi,
                    '<div class="code-block" data-preserve="true"'
                )
                .replace(
                    /<p class="code-content"/gi,
                    '<p class="code-content" data-preserve="true"'
                )
        )
    }

    // 转换HTML为适合Quill的格式
    static convertForQuill(html) {
        const sanitized = this.sanitize(html)
        // 包装代码块为Quill可识别的结构
        return sanitized
            .replace(
                /<div class="code-block"/gi,
                '<div class="code-block" data-quill-type="code-block"'
            )
            .replace(
                /<p class="code-content"/gi,
                '<p class="code-content" data-quill-type="code-content"'
            )
    }
}
// 4. 关键修复：自定义剪贴板模块，完全控制HTML处理
class CustomClipboard extends Quill.import('modules/clipboard') {
    constructor(quill, options) {
        super(quill, options)
        // 注册自定义元素的解析规则（关键）
        this.addMatchers()
    }

    // 添加匹配器：告诉 Quill 如何处理自定义元素
    addMatchers() {
        // 引入 Delta 构造器
        const Delta = Quill.import('delta')
        this.matchers.push([
            'div.code-block',
            (node, delta) => {
                const text = node.innerText || ''
                return new Delta().insert({ 'code-block-embed': text })
            }
        ])
        /*（可选）兼容 <pre><code> 的传统结构 */
        this.matchers.push([
            'pre code',
            (node, delta) => {
                const text = node.textContent + '\n'
                return new Delta().insert(text, { 'code-block': true })
            }
        ])
    }

    // 仅修复必要的异常处理，复用原生粘贴逻辑
    dangerouslyPasteHTML(index, html, source = Quill.sources.API) {
        try {
            // 1. 修正索引（仅处理你的特定需求）
            const length = this.quill.getLength()
            if (index < 0 || index > length) {
                index = Math.max(0, Math.min(index, length))
            }
            // 2. 调用原生方法处理粘贴，确保默认功能正常
            return super.dangerouslyPasteHTML(index, html, source)
        } catch (error) {
            console.error('粘贴失败:', error)
            throw error
        }
    }
}

// 注册模块
Quill.register('modules/clipboard', CustomClipboard, true)


export default Quill;