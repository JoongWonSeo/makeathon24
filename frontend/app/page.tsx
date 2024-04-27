"use client";

import { useState, useEffect, useContext } from "react";
import { useSynced, DefaultSessionContext, useRemoteToast } from "ws-sync";

import "allotment/dist/style.css";

import { FaHeart } from "react-icons/fa6";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";

import { Chat, ChatAvatar, Messages, initialMessages } from "@/components/chat";
import { toast } from "sonner";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarLayout } from "@/components/sidebar/layout";
import { MD } from "@/components/base/md";
import { Settings } from "@/components/settings";

export default function Home() {
  // UI state
  const [showSystem, setShowSystem] = useState(false);

  // connection
  const session = useContext(DefaultSessionContext);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  useRemoteToast(session, toast);

  // assistant settings
  const gpt = useSynced("GPT", {
    modelList: [] as string[],
    selectedModel: "",
    temperature: 1.0,
    runningTasks: [] as string[],
  });

  // assistant state
  const messages = useSynced<Messages>("MESSAGES", initialMessages);

  // auto connect on mount
  useEffect(() => {
    if (session) session.onConnectionChange = setIsConnected;
  }, []);

  return (
    <SidebarLayout
      leftSidebar={
        <div className="flex flex-col content-between h-full max-h-screen">
          <Sidebar
            gpt={gpt}
            messages={messages}
            showSystem={showSystem}
            setShowSystem={setShowSystem}
          />

          <div className="flex flex-wrap justify-between p-2 items-center bg-default-100">
            <Settings gpt={gpt} />
          </div>
        </div>
      }
      rightSidebar={
        <div className="h-full">
          <Chat
            history={
              messages.partial
                ? [...messages.history, messages.partial]
                : messages.history
            }
            onSend={(message) => {
              gpt.startTask({ type: "PROMPT", prompt: message });
            }}
            onCancel={() => {
              gpt.cancelTask({ type: "PROMPT" });
            }}
            isConnected={isConnected}
            isGenerating={gpt.runningTasks.includes("PROMPT")}
            showSystem={showSystem}
            header={
              <>
                <Card className="my-10 p-3 flex-none self-center max-w-lg bg-default/50 backdrop-saturate-200 shadow-md">
                  <CardHeader className="justify-center">
                    <ChatAvatar className="mr-3 scale-125" role="assistant" />
                    <h1 className="text-xl text-primary-foreground font-bold">
                      Welcome!
                    </h1>
                  </CardHeader>
                  <CardBody>
                    <MD className="leading-5">
                      {`
I'm your assistant, I can help you with the following tasks:
- Find an information on the internet
- Open a link and answer questions

Additionally, you can switch the model and temperature on the sidebar.
                      `}
                    </MD>
                  </CardBody>
                  <CardFooter className="justify-center">
                    <p className="text-xs text-primary/100">
                      Made with{" "}
                      <FaHeart className="inline-block align-text-bottom" /> by
                      Team A(sian)Intelligence
                    </p>
                  </CardFooter>
                </Card>

                {/* spacer to fill any gap below the welcome */}
                <div className="grow shrink-0" />
              </>
            }
          />
        </div>
      }
    >
      {/* main editor view */}
      <div>hello im the main view</div>
    </SidebarLayout>
  );
}
