import React, { useState, useRef, useEffect, useMemo, Fragment } from "react";
import { produce } from "immer";
import AudioStream from "./AudioStream";
import axios from "axios";

import { js_beautify } from "js-beautify";
import {
  FaAnglesDown,
  FaAnglesUp,
  FaCircleCheck,
  FaHeart,
  FaStop,
  FaPaperPlane,
  FaPlus,
  FaUser,
  FaMicrophone,
} from "react-icons/fa6";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Textarea,
  Spinner,
  ScrollShadow,
} from "@nextui-org/react";
import { Expander, ExpanderItem } from "@/components/base/expander";
import { MD } from "@/components/base/md";
import { set } from "lodash";
import {
  animate,
  motion,
  useAnimate,
  useMotionValue,
  usePresence,
  useTransform,
} from "framer-motion";

import { createClient } from "@deepgram/sdk";

const deepgram = createClient("145faac3d565afff8f351eb18c5ce05a082b8a20");

let audioBuffer: string[] = [];
var aiIsTalking = false;
// TTS with ElevenLabs API
export const startStreaming = async (text: String) => {
  const baseUrl = "https://api.elevenlabs.io/v1/text-to-speech";
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": "ce7e76d856ff7e5f5c4dc929e258c0c6",
  };

  const requestBody = {
    text,
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.8,
    },
    // model_id: "eleven_turbo_v2",
  };

  try {
    const response = await axios.post(
      `${baseUrl}/GA39yKeJ4dBzsFLMDfnB`,
      requestBody,
      {
        headers,
        responseType: "blob",
      }
    );

    if (response.status === 200) {
      const audioURL = URL.createObjectURL(response.data);
      audioBuffer.push(audioURL);

      // If there's only one item in the buffer, play it immediately
      if (audioBuffer.length === 1) {
        playAudio();
        aiIsTalking = true;
      }
    } else {
    }
  } catch (error) {
  } finally {
  }
};

const playAudio = () => {
  if (audioBuffer.length > 0) {
    const audio = new Audio(audioBuffer[0]);

    // Event listener to handle when audio finishes playing
    audio.onended = () => {
      // Remove the first item from the buffer and play the next if available
      audioBuffer.shift();
      if (audioBuffer.length > 0) {
        playAudio();
        aiIsTalking = true;
      } else {
        aiIsTalking = false;
        console.log("done");
      }
    };

    audio.play();
    aiIsTalking = true;
  }
};

// define messages state object and its reducer
type Message = {
  role: string;
  content?: string;
  tool_calls?: any[];
  tool_call_id?: string;
};

type Messages = {
  history: Message[];
  partial: Message | null;
};
const initialMessages: Messages = {
  history: [],
  partial: null,
};

export type { Message, Messages };
export { initialMessages };

// UI
interface ToolProps {
  tool_call: any;
}

const DefaultTool = ({ tool_call }: ToolProps) => (
  <div>
    <MD>
      {`\`\`\`json\n${js_beautify(tool_call.function.arguments, {
        indent_size: 2,
      })}\n\`\`\``}
    </MD>
    {tool_call.result ? <MD>{`**Result:** \`${tool_call.result}\``}</MD> : null}
  </div>
);

const toolRenderers = (tool_name: string, tool_call: any) => {
  let args = null;
  try {
    args = JSON.parse(tool_call.function.arguments);
  } catch (e) {}
  switch (tool_name) {
    case "get_car_recommendations":
      //call API to get car details
      //update carList in showroom.tsx

      return {
        title: "Finding Cars",
        subtitle: args?.title,
        Renderer: DefaultTool,
        open: false,
      };

    case "show_testdrive_booking":
      return {
        title: "Book Test Drive",
        Renderer: DefaultTool,
        open: false,
      };

    default:
      return { title: tool_name, Renderer: DefaultTool, open: false };
  }
};

const toolFootnotes = (tool_call: any) => {
  const n = tool_call.function.name;
  switch (n) {
    // case 'web_search':
    // case 'full_text_from_url':
    //   return [tool_call.result]
    default:
      return [];
  }
};

const ToolCalls = ({ message }: { message: Message }) => {
  const tool_calls = message.tool_calls!;

  return (
    <Expander
      defaultExpandedKeys={tool_calls
        .filter((m) => toolRenderers(m.function.name, m).open)
        .map((m) => m.id)}
      showDivider
      variant="bordered"
    >
      {tool_calls.map((tool_call) => {
        const { title, Renderer, subtitle } = toolRenderers(
          tool_call.function.name,
          tool_call
        );
        return (
          <ExpanderItem
            key={tool_call.id}
            title={
              <div className="flex gap-2 items-center">
                {tool_call.result ? (
                  <FaCircleCheck className="text-primary/100 text-lg" />
                ) : (
                  <Spinner color="primary" size="sm" />
                )}
                {title}
              </div>
            }
            subtitle={subtitle}
            textValue="Function Call"
          >
            <Renderer tool_call={tool_call} />
          </ExpanderItem>
        );
      })}
    </Expander>
  );
};

type ChatMessageProps = {
  messageGroup: Message[];
  className?: string;
};

const ChatAvatar = ({
  role,
  className,
}: {
  role: string;
  className?: string;
}) => {
  switch (role) {
    case "user":
      return (
        <div></div>
        // <Avatar
        //   size="sm"
        //   className={`${className} text-primary/100`}
        //   showFallback
        // />
      );
    case "assistant":
      return (
        <Avatar
          size="sm"
          className={`${className}`}
          classNames={{ img: "dark:invert" }}
          src="/mercedes_logo_small.jpg"
        />
      );
    case "system":
      return <Avatar size="sm" className={`${className}`} name="S" />;
    default:
      return <Avatar size="sm" className={`${className}`} name="?" />;
  }
};
const style: { [key: string]: string } = {
  user: "bg-[#1A1A1A]",
  assistant: "bg-[#DDE2EB]",
  system: "bg-primary/50",
};
const dstyle: { [key: string]: string } = {
  user: "flex-row-reverse",
  assistant: "",
  system: "",
};

const pstyle: { [key: string]: string } = {
  user: "prose-p:text-white",
  assistant: "prose-p:text-black",
  system: "",
};

const ChatMessage = ({ messageGroup, className }: ChatMessageProps) => {
  const cls = style[messageGroup[0].role];
  const d = dstyle[messageGroup[0].role];
  const pS = pstyle[messageGroup[0].role];

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
      className={`flex ${d}`}
      // layout="position" // causes overlaps, so disabled for now
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 50 }}
    >
      <ChatAvatar
        className="flex-none ml-4 mr-2 mt-auto"
        role={messageGroup[0].role}
      />
      <Card className={`rounded-md shadow-none mr-4 ${cls} ${className ?? ""}`}>
        <CardBody className="flex flex-row p-0">
          <div className="min-w-0 w-full flex flex-col gap-2 p-4 ">
            {messageGroup.map((message, i) => (
              <Fragment key={i}>
                <MD className={`prose-p:font-light prose-p:text-sm ${pS}`}>
                  {message.content &&
                    message.content.replaceAll("\n", "  \n") +
                      (footnotes.length > 0
                        ? "\n\n---\n**Sources**\n\n" + footnotes.join("\n\n")
                        : "")}
                </MD>
                {(message.tool_calls?.length ?? 0) > 0 ? (
                  <ToolCalls message={message} />
                ) : null}
              </Fragment>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

type ChatInputProps = {
  onSend: (message: string) => void;
  onCancel: () => void;
  isGenerating: boolean;
  className?: string;
  showroom: any;
};
var stringBuffer: any = "";

const ChatInput = ({
  onSend,
  onCancel,
  isGenerating,
  className,
  showroom,
}: ChatInputProps) => {
  const enterToSend = true;
  const [inputValue, setInputValue] = useState("");
  const [textBoxHeight, setTextBoxHeight] = useState(0);

  const [isActivated, setMicActive] = useState(false);

  async function getMicrophone() {
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    return new MediaRecorder(userMedia);
  }

  async function openMicrophone(microphone: any, socket: any) {
    await microphone.start(500);

    microphone.onstart = () => {
      console.log("client: microphone opened");
      document.body.classList.add("recording");
    };

    microphone.onstop = () => {
      console.log("client: microphone closed");
      document.body.classList.remove("recording");
    };

    microphone.ondataavailable = (e: any) => {
      const data = e.data;
      console.log("client: sent data to websocket");
      if (isGenerating || aiIsTalking) {
        // send a keepalive message
        const keepAliveMsg = JSON.stringify({ type: "KeepAlive" });
        socket.send(keepAliveMsg);
        return;
      }
      socket.send(data);
    };
  }

  async function closeMicrophone(microphone: any) {
    microphone.stop();
  }

  let microphone: any;
  async function start(socket: any) {
    // if (isActivated) {
    //   console.log("client: closing microphone");
    //   await closeMicrophone(microphone);
    //   setMicActive(false);
    //   return;
    // }
    microphone = await getMicrophone();
    await openMicrophone(microphone, socket);
    setMicActive(true);
  }
  var socket: any;

  const startDG = async () => {
    socket = deepgram.listen.live({
      model: "nova-2",
      smart_format: true,
      interim_results: true,
      utterance_end_ms: 1000,
    });
    socket.on("open", async () => {
      console.log("client: connected to websocket");

      socket.on("UtteranceEnd", (data: any) => {
        console.log(data);
        console.log(stringBuffer);
        onSend(stringBuffer);
        stringBuffer = "";
      });

      socket.on("Results", (data: any) => {
        console.log(data);

        const transcript = data.channel.alternatives[0].transcript;

        console.log(transcript);
        if (transcript.trim() !== "") {
          if (data.is_final) {
            stringBuffer = stringBuffer + " " + transcript;
            setInputValue(stringBuffer);
          } else {
            setInputValue(stringBuffer + " " + transcript);
          }
        }
      });

      socket.on("error", (e: any) => console.error(e));

      socket.on("warning", (e: any) => console.warn(e));

      socket.on("Metadata", (e: any) => console.log(e));

      socket.on("close", (e: any) => console.log(e));

      await start(socket);
    });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "" && !isGenerating) {
      onSend(inputValue);
      setInputValue("");
    }
  };

  const carList = showroom.showing;

  return (
    <div>
      {carList.map((car: any, i: number) => (
        <div
          key={i}
          className="bg-white w-full border-1 p-[0.8rem] flex items-center "
          onClick={() => {
            const textToSend = `I like the ${car.specs.model} (${car.vehicle_type} • ${car.num_seats} Seats •${car.powertrain_type})`;
            onSend(textToSend);
          }}
        >
          <FaPlus className="text-[#0078d6] text-sm"></FaPlus>
          <p className="ml-4 text-[#0078d6] select-none text-sm cursor-pointer">
            I like the {car.specs.model} ({car.vehicle_type} • {car.num_seats}{" "}
            Seats • {car.powertrain_type})
          </p>
        </div>
      ))}

      <div
        className={`flex flex-row items-center justify-center border py-4 bg-white focus:outline-none resize-none shadow-lg backdrop-blur overflow-y-visible ${className}`}
      >
        <Textarea
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={(event) => {
            if (enterToSend && event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
          classNames={{
            inputWrapper:
              "bg-transparent shadow-none focus:shadow-none focus:bg-transparent",
            input: "text-black",
          }}
          className="ml-5"
          style={{ fontSize: "1rem" }}
          placeholder="Type your message..."
          minRows={1}
          maxRows={15}
          onHeightChange={setTextBoxHeight}
        />
        <button
          onClick={async () => {
            // startStreaming(
            //   "Hey there! I'm Merry, the voice of Mercedes. How can I help you today?"
            // );
            await startDG();
          }}
          className="m-2 px-0 py-0 "
        >
          <FaMicrophone className="text-2xl" />
        </button>
        <button
          // isIconOnly
          onClick={isGenerating ? onCancel : handleSendMessage}
          color={isGenerating ? "danger" : "primary"}
          className="m-2 px-0 py-0 "
          style={{ height: textBoxHeight + 10 }}
        >
          {isGenerating ? (
            <FaStop className="text-2xl" />
          ) : (
            <svg
              width="2em"
              height="1.5em"
              viewBox="0 0 24 24"
              fill="none"
              color="gray"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.264 2C2.878 2 1.496 4.703 2.893 6.637L6.766 12l-3.873 5.363C1.496 19.297 2.878 22 5.263 22c.651 0 1.291-.163 1.862-.475l13.44-7.33c1.737-.948 1.737-3.442 0-4.39l-13.44-7.33A3.887 3.887 0 0 0 5.264 2Zm-.75 3.466A.925.925 0 0 1 5.264 4c.315 0 .626.08.903.23L18.578 11H8.511L4.514 5.466ZM8.511 13l-3.997 5.534A.925.925 0 0 0 5.264 20c.315 0 .626-.08.903-.23L18.578 13H8.511Z"
                fill="currentColor"
              ></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// main chat view
type ChatProps = {
  history: Message[];
  onSend: (message: string) => void;
  onCancel: () => void;
  isConnected: boolean;
  isGenerating: boolean;
  showSystem: boolean;
  header?: React.ReactNode;
  showroom: any;
};

const Chat = ({
  history,
  onSend,
  onCancel,
  isConnected,
  isGenerating,
  showSystem,
  header,
  showroom,
}: ChatProps) => {
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isBottom, setIsBottom] = useState(true);

  const scrollToBottom = (behavior: ScrollBehavior = "auto", force = false) => {
    const chatContainer = chatBottomRef.current;
    if (chatContainer && (force || isBottom)) {
      chatContainer.scrollIntoView({
        behavior: behavior,
        block: "end",
        inline: "nearest",
      });
    }
  };

  // detect if user is at the bottom of the chat
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.target as HTMLDivElement;
    const bottom =
      Math.abs(t.scrollHeight - (t.scrollTop + t.clientHeight)) <= 50;
    setIsBottom(bottom);
  };

  // scroll to bottom when new messages are added
  useEffect(() => scrollToBottom(), [history]);

  // scroll to bottom when window is resized
  useEffect(() => {
    window.addEventListener("resize", () => {
      scrollToBottom();
    });
    return () => window.removeEventListener("resize", () => {});
  }, []);

  const mergedMessages = useMemo(() => {
    // split history into tool messages and non-tool messages
    const initial: { msgs: Message[]; tools: any } = { msgs: [], tools: {} };

    const { msgs, tools } = history.reduce(({ msgs, tools }, msg, i) => {
      if (msg.role == "tool") {
        tools[msg.tool_call_id!] = msg.content;
      } else {
        msgs.push(msg);
      }
      return { msgs, tools };
    }, initial);

    // convert to format better suited for rendering
    const mergedMsgs: Message[][] = [];
    msgs.forEach((msg, i) => {
      // remove tool messages
      if (msg.role == "tool") {
        return;
      }
      // copy msg to avoid mutating the original
      msg = { ...msg };
      // add tool results to the tool calls
      if (msg.role == "assistant") {
        msg.tool_calls = msg.tool_calls?.map((tool_call: any) => ({
          ...tool_call,
          result: tools[tool_call.id], // artificially add the result to the tool call
        }));
      }
      // merge consecutive messages of same role
      if (i == 0 || msg.role != msgs[i - 1].role) {
        mergedMsgs.push([msg]);
      } else {
        mergedMsgs[mergedMsgs.length - 1].push(msg);
      }
    });

    return mergedMsgs;
  }, [history]);

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-scroll"
      onScroll={onScroll}
    >
      {header}

      <div className="flex flex-col gap-2 px-2 mb-6 self-center w-full max-w-3xl">
        {mergedMessages.map((msgGroup, index) => {
          if (msgGroup[0].role === "system" && !showSystem) return null;
          return (
            <ChatMessage messageGroup={msgGroup} key={index} className="" />
          );
        })}
      </div>

      {/* TODO: remove padding and put it to page.tsx instead */}
      <div className="sticky bottom-0 self-center w-full max-w-3xl">
        {!isBottom && (
          <div className="relative">
            <button
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-8 rounded-full text-tiny text-default-600 border border-default-600 flex items-center justify-center backdrop-blur-sm bg-default-50/10 hover:bg-primary hover:scale-125 transition shadow-lg"
              onClick={() => {
                scrollToBottom("smooth", true);
              }}
            >
              <FaAnglesDown />
            </button>
          </div>
        )}
        {isConnected ? (
          <ChatInput
            showroom={showroom}
            onSend={(m) => {
              setIsBottom(true);
              onSend(m);
            }}
            onCancel={onCancel}
            isGenerating={isGenerating}
          />
        ) : (
          <Card className="bg-danger rounded-3xl shadow-md backdrop-blur">
            <CardBody className="flex flex-row gap-5 items-center">
              <Spinner color="default" />
              <p className="text-danger-foreground">
                Reconnecting to the server...
              </p>
            </CardBody>
          </Card>
        )}
      </div>
      <div ref={chatBottomRef} className="h-0 invisible"></div>
    </div>
  );
};

export { ChatMessage, ChatAvatar, ChatInput, Chat };
