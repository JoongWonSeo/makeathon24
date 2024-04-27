import React from 'react'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you


interface MDProps {
  className?: string
  children?: string
  props?: any
}

const MD = React.forwardRef<HTMLDivElement, MDProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`overflow-auto prose dark:prose-invert prose-neutral max-w-none prose-pre:max-w-full prose-code:before:hidden prose-code:after:hidden ${className ?? ''}`}>
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      {...props}
    >
      {children}
    </Markdown>
  </div>
));
MD.displayName = 'MD'

export { MD }
