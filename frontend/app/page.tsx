"use client";

import { useState, useEffect, useContext } from "react";
import {
  useSynced,
  DefaultSessionContext,
  useRemoteToast,
  useSyncedReducer,
  SyncedReducer,
} from "ws-sync";

import "allotment/dist/style.css";

import { FaHeart } from "react-icons/fa6";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";

import {
  Chat,
  ChatAvatar,
  Messages,
  initialMessages,
  startStreaming,
} from "@/components/chat";
import { toast } from "sonner";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarLayout } from "@/components/sidebar/layout";
import { MD } from "@/components/base/md";
import { Settings } from "@/components/settings";
import { Showroom } from "@/components/showroom";

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
  const messageReducer: SyncedReducer<Messages> = (
    draft,
    action,
    sync,
    delegate
  ) => {
    switch (action.type) {
      // triggered by server, handled by local
      case "SPEAK_MESSAGE":
        const text = action.text;
        if (text) {
          startStreaming(text);
        }
        break;

      // triggered by local, handled by server
      default:
        delegate();
    }
  };
  const [messages, dispatchMessages] = useSyncedReducer<Messages>(
    "MESSAGES",
    messageReducer,
    initialMessages
  );

  // showroom state
  const showroom = useSynced("SHOWROOM", {
    showing: [] as object[],
    isTestdriveBooking: false,
  });

  //backstage state
  const backstage = useSynced("BACKSTAGE", {
    filters: "",
    preferences: "",
  });

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
            backstage={backstage}
            showSystem={showSystem}
            setShowSystem={setShowSystem}
          />

          <div className="flex flex-wrap justify-between p-2 items-center bg-default-100">
            <Settings gpt={gpt} />
          </div>
        </div>
      }
      rightSidebar={
        <div className="h-full bg-[#FDFDFD]">
          <Chat
            showroom={showroom}
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
                <Card className="my-10 p-3 flex-none self-center max-w-lg shadow-none bg-transparent">
                  <CardHeader className="justify-center">
                    <ChatAvatar className="mr-3 scale-125" role="assistant" />
                    <h1 className="text-xl text-primary-foreground font-bold">
                      Welcome to Mercedes-Benz!
                    </h1>
                  </CardHeader>
                  <CardBody>
                    <MD className="leading-5">
                      {`
Merry can help you find the perfect car for you. She has access to all Mercedes-Benz models and will find personalized recommendations.

Make yourself at home and have a little chat!
                      `}
                    </MD>
                  </CardBody>
                  <CardFooter className="justify-center">
                    <p className="text-xs ">
                      Made with{" "}
                      <FaHeart className="inline-block align-text-bottom" /> by
                      J, F, V and L
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
      <Showroom showroom={showroom} />
    </SidebarLayout>
  );
}
