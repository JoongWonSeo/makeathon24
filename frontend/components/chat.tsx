import React, { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { produce } from 'immer'

import { js_beautify } from "js-beautify"
import { FaAnglesDown, FaAnglesUp, FaCircleCheck, FaHeart, FaStop, FaUser } from "react-icons/fa6"

import { Button, Card, CardHeader, CardBody, CardFooter, Avatar, Textarea, Spinner, ScrollShadow } from "@nextui-org/react"
import { Expander, ExpanderItem } from '@/components/base/expander'
import { MD } from '@/components/base/md'
import { set } from 'lodash'
import { animate, motion, useAnimate, useMotionValue, usePresence, useTransform } from 'framer-motion'


// define messages state object and its reducer
type Message = {
  role: string,
  content?: string,
  tool_calls?: any[],
  tool_call_id?: string
}

type Messages = {
  history: Message[],
  partial: Message | null,
}
const initialMessages: Messages = {
  history: [],
  partial: null,
}

export type { Message, Messages }
export { initialMessages }


// UI
interface ToolProps {
  tool_call: any,
}

const DefaultTool = ({ tool_call }: ToolProps) => (
  <div>
    <MD>
      {`\`\`\`json\n${js_beautify(tool_call.function.arguments, { indent_size: 2 })}\n\`\`\``}
    </MD>
    {
      tool_call.result
        ? <MD>{`**Result:** \`${tool_call.result}\``}</MD>
        : null
    }
  </div>
)


const toolRenderers = (tool_name: string, tool_call: any) => {
  let args = null;
  try {
    args = JSON.parse(tool_call.function.arguments)
  } catch (e) { }
  switch (tool_name) {
    case 'create_usecase':
      return { title: 'Create Use Case', subtitle: args?.title, Renderer: DefaultTool, open: false }
    case 'update_usecase':
      return { title: 'Update Use Case', subtitle: args?.title, Renderer: DefaultTool, open: false }
    case 'delete_usecase':
      return { title: 'Delete Use Case', Renderer: DefaultTool, open: false }
    case 'generate_detailed':
      return { title: 'Generate Detailed', Renderer: DefaultTool, open: false }
    case 'modify_usecase':
      return { title: 'Modify Use Case', Renderer: DefaultTool, open: false }
    case 'web_search':
      return { title: 'Web Search', subtitle: args?.query, Renderer: DefaultTool, open: false }
    case 'full_text_from_url':
      return { title: 'Read Page', subtitle: args?.url, Renderer: DefaultTool, open: false }
    default:
      return { title: tool_name, Renderer: DefaultTool, open: true }
  }
}

const toolFootnotes = (tool_call: any) => {
  const n = tool_call.function.name
  switch (n) {
    // case 'web_search':
    // case 'full_text_from_url':
    //   return [tool_call.result]
    default:
      return []
  }
}

const ToolCalls = ({ message }: { message: Message }) => {
  const tool_calls = message.tool_calls!

  return (<Expander
    defaultExpandedKeys={
      tool_calls.filter((m) => toolRenderers(m.function.name, m).open).map((m) => m.id)
    }
    showDivider
    variant='bordered'
  >
    {
      tool_calls.map((tool_call) => {
        const { title, Renderer, subtitle } = toolRenderers(tool_call.function.name, tool_call)
        return (
          <ExpanderItem
            key={tool_call.id}
            title={
              <div className='flex gap-2 items-center'>
                {tool_call.result ? (
                  <FaCircleCheck className='text-primary/100 text-lg' />
                ) : (
                  <Spinner color='primary' size='sm' />
                )}
                {title}
              </div>
            }
            subtitle={subtitle}
            textValue='Function Call'
          >
            <Renderer tool_call={tool_call} />
          </ExpanderItem>
        )
      })
    }
  </Expander>)
}


type ChatMessageProps = {
  messageGroup: Message[]
  className?: string
}


const ChatAvatar = ({ role, className }: { role: string, className?: string }) => {
  switch (role) {
    case 'user':
      return <Avatar size='sm' className={`${className} text-primary/100`} showFallback />
    case 'assistant':
      return <Avatar size='sm' className={`${className}`} classNames={{ 'img': 'dark:invert' }} src='/ChatGPT_logo.png' />
    case 'system':
      return <Avatar size='sm' className={`${className}`} name='S' />
    default:
      return <Avatar size='sm' className={`${className}`} name='?' />
  }
}
const style: { [key: string]: string } = {
  "user": "bg-default/50",
  "assistant": "bg-default/50",
  "system": "bg-primary/50",
}
const dstyle: { [key: string]: string } = {
  "user": "",
  "assistant": "backdrop-saturate-200",
  "system": "",
}

const ChatMessage = ({ messageGroup, className }: ChatMessageProps) => {
  const cls = style[messageGroup[0].role]
  const d = dstyle[messageGroup[0].role]

  // some tools need to inject footnotes into the message
  const footnotes: string[] = [];
  for (const message of messageGroup) {
    if (message.tool_calls) {
      for (const tool_call of message.tool_calls) {
        footnotes.push(...toolFootnotes(tool_call));
      }
    }
  }

  return (
    <motion.div
      className={`rounded-3xl ${d}`}
      // layout="position" // causes overlaps, so disabled for now
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 50 }}
    >
      <Card className={`rounded-3xl ${cls} shadow-md ${className ?? ''}`}>
        <CardBody className='flex flex-row p-0'>
          <ChatAvatar className='flex-none m-4 ' role={messageGroup[0].role} />
          <div className='min-w-0 w-full flex flex-col gap-2 p-4 pl-0'>
            {
              messageGroup.map((message, i) => (
                <Fragment key={i}>
                  <MD>
                    {
                      message.content &&
                      message.content.replaceAll('\n', '  \n')
                      + (footnotes.length > 0 ? '\n\n---\n**Sources**\n\n' + footnotes.join('\n\n') : '')
                    }
                  </MD>
                  {
                    (message.tool_calls?.length ?? 0) > 0
                      ? <ToolCalls message={message} />
                      : null
                  }
                </Fragment>
              ))

            }
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

type ChatInputProps = {
  onSend: (message: string) => void
  onCancel: () => void
  isGenerating: boolean
  className?: string
}

const ChatInput = ({ onSend, onCancel, isGenerating, className }: ChatInputProps) => {
  const enterToSend = true;
  const [inputValue, setInputValue] = useState('')
  const [textBoxHeight, setTextBoxHeight] = useState(0)

  const handleSendMessage = () => {
    if (inputValue.trim() !== '' && !isGenerating) {
      onSend(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className={`flex flex-row items-center justify-center border bg-default-50 rounded-3xl focus:outline-none resize-none shadow-lg backdrop-blur overflow-y-visible ${className}`}>
      <Textarea
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={(event) => {
          if (enterToSend && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSendMessage()
          }
        }}
        variant='underlined'
        className="ml-5"
        style={{ fontSize: '1rem' }}
        placeholder="Type your message..."
        minRows={1}
        maxRows={15}
        onHeightChange={setTextBoxHeight}
      />
      <Button
        isIconOnly
        onClick={isGenerating ? onCancel : handleSendMessage}
        color={isGenerating ? 'danger' : 'primary'}
        className="m-2 px-4 py-2 rounded-3xl shadow-lg hover:scale-[1.2] hover:bg-current/100"
        style={{ height: textBoxHeight + 10 }}
      >
        {
          isGenerating
            ? <FaStop className='text-2xl' />
            : <FaAnglesUp className='text-2xl' />
        }
      </Button>
    </div>
  )
}

// main chat view
type ChatProps = {
  history: Message[]
  onSend: (message: string) => void
  onCancel: () => void
  isConnected: boolean
  isGenerating: boolean
  showSystem: boolean
  header?: React.ReactNode
}

const Chat = ({ history, onSend, onCancel, isConnected, isGenerating, showSystem, header }: ChatProps) => {
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const [isBottom, setIsBottom] = useState(true)

  const scrollToBottom = (behavior: ScrollBehavior = "auto", force = false) => {
    const chatContainer = chatBottomRef.current;
    if (chatContainer && (force || isBottom)) {
      chatContainer.scrollIntoView({ behavior: behavior, block: "end", inline: "nearest" })
    }
  }

  // detect if user is at the bottom of the chat
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.target as HTMLDivElement
    const bottom = Math.abs(t.scrollHeight - (t.scrollTop + t.clientHeight)) <= 50;
    setIsBottom(bottom)
  }

  // scroll to bottom when new messages are added
  useEffect(() => scrollToBottom(), [history])

  // scroll to bottom when window is resized
  useEffect(() => {
    window.addEventListener("resize", () => {
      scrollToBottom()
    })
    return () => window.removeEventListener("resize", () => { })
  }, [])


  const mergedMessages = useMemo(() => {
    // split history into tool messages and non-tool messages
    const initial: { msgs: Message[], tools: any } = { msgs: [], tools: {} }

    const { msgs, tools } = history.reduce(({ msgs, tools }, msg, i) => {
      if (msg.role == 'tool') {
        tools[msg.tool_call_id!] = msg.content
      } else {
        msgs.push(msg)
      }
      return { msgs, tools }
    }, initial)

    // convert to format better suited for rendering
    const mergedMsgs: Message[][] = []
    msgs.forEach((msg, i) => {
      // remove tool messages
      if (msg.role == 'tool') {
        return
      }
      // copy msg to avoid mutating the original
      msg = { ...msg }
      // add tool results to the tool calls
      if (msg.role == 'assistant') {
        msg.tool_calls = msg.tool_calls?.map((tool_call: any) => ({
          ...tool_call,
          result: tools[tool_call.id] // artificially add the result to the tool call
        }))
      }
      // merge consecutive messages of same role
      if (i == 0 || msg.role != msgs[i - 1].role) {
        mergedMsgs.push([msg])
      } else {
        mergedMsgs[mergedMsgs.length - 1].push(msg)
      }
    })

    return mergedMsgs
  }, [history])

  return (
    <ScrollShadow
      className="w-full h-full flex flex-col overflow-y-scroll"
      onScroll={onScroll}
    >
      {header}

      <div className='flex flex-col gap-2 px-2 mb-6 self-center w-full max-w-3xl'>
        {mergedMessages.map(
          (msgGroup, index) => {
            if (msgGroup[0].role === 'system' && !showSystem)
              return null
            return <ChatMessage messageGroup={msgGroup} key={index} className='' />
          }
        )}
      </div>

      {/* TODO: remove padding and put it to page.tsx instead */}
      <div className="sticky bottom-0 self-center pb-5 px-2 w-full max-w-3xl">
        {
          !isBottom &&
          <div className="relative">
            <button
              className='absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-8 rounded-full text-tiny text-default-600 border border-default-600 flex items-center justify-center backdrop-blur-sm bg-default-50/10 hover:bg-primary hover:scale-125 transition shadow-lg'
              onClick={() => { scrollToBottom("smooth", true) }}
            >
              <FaAnglesDown />
            </button>
          </div>
        }
        {
          isConnected ? (
            <ChatInput
              onSend={(m) => {
                setIsBottom(true)
                onSend(m)
              }}
              onCancel={onCancel}
              isGenerating={isGenerating} />
          )
            : (
              <Card className='bg-danger rounded-3xl shadow-md backdrop-blur'>
                <CardBody className='flex flex-row gap-5 items-center'>
                  <Spinner color='default' />
                  <p className='text-danger-foreground'>Reconnecting to the server...</p>
                </CardBody>
              </Card>
            )
        }
      </div>
      <div ref={chatBottomRef} className='h-0 invisible'></div>
    </ScrollShadow>);
}


export { ChatMessage, ChatAvatar, ChatInput, Chat }
