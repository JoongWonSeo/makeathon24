import { Button, ScrollShadow, Slider, Switch } from "@nextui-org/react";
import { Expander, ExpanderItem } from "../base/expander";
import { SingleSelect } from "../base/single-select";
import { FaFileArrowDown, FaFileArrowUp, FaRecycle } from "react-icons/fa6";
import { ConfirmButton, PopTooltip } from "../base/confirm-button";
import { toast } from "sonner";
import fileDownload from "js-file-download";
import { useState } from "react";
import { Tooltip } from "../base/tooltip";

interface SaveChatProps {
  messages: any;
}

const SaveChat = ({ messages }: SaveChatProps) => {
  return (
    <Tooltip content="Save Chat as .json File">
      <Button
        className="grow"
        onClick={() => {
          fileDownload(JSON.stringify(messages.history), "chat.json");
          toast.success("Chat downloaded!");
        }}
      >
        <FaFileArrowDown className="flex-none" /> Save Chat
      </Button>
    </Tooltip>
  );
};

interface LoadChatProps {
  messages: any;
}

const LoadChat = ({ messages }: LoadChatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopTooltip
      className="grow"
      tooltip="Load Chat from .json File"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      popoverProps={{
        backdrop: "blur",
      }}
      trigger={
        <Button fullWidth>
          <FaFileArrowUp className="flex-none" /> Load Chat
        </Button>
      }
    >
      <div className="px-1 py-2">
        <div className="text-small font-bold pb-3">
          Load Chat from .json File
        </div>
        <div className="text-danger font-bold pb-3">
          {`Warning: Your current chat history will be overwritten!`}
        </div>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const json = e.target?.result;
                if (json) {
                  try {
                    messages.syncHistory(JSON.parse(json as string));
                    toast.success("Chat loaded!");
                  } catch (e) {
                    toast.error(`Error loading chat: ${e}`);
                  } finally {
                    setIsOpen(false);
                  }
                }
              };
              reader.readAsText(file);
            }
          }}
        />
      </div>
    </PopTooltip>
  );
};

interface SidebarProps {
  gpt: any;
  messages: any;
  showSystem: boolean;
  setShowSystem: (show: boolean) => void;
  className?: string;
}

const Sidebar = ({
  gpt,
  messages,
  showSystem,
  setShowSystem,
  className,
}: SidebarProps) => {
  return (
    <div className={`flex flex-col min-h-0 h-full ${className || ""}`}>
      <div className="w-full h-full flex flex-col overflow-auto">
        <ScrollShadow></ScrollShadow>
      </div>

      <Expander variant="light" defaultExpandedKeys={["1", "2"]}>
        <ExpanderItem title="Model Options" key="1">
          <SingleSelect
            label="model"
            selected={gpt.selectedModel}
            setSelected={gpt.syncSelectedModel}
            valGroups={gpt.modelList}
          />

          <Slider
            size="sm"
            minValue={0}
            maxValue={2}
            step={0.1}
            value={gpt.temperature}
            onChange={gpt.setTemperature}
            onChangeEnd={gpt.syncTemperature}
            label="Temperature"
          />
        </ExpanderItem>

        <ExpanderItem title="Chat Options" key="2">
          <Switch
            size="sm"
            color="primary"
            isSelected={showSystem}
            onValueChange={setShowSystem}
          >
            Show System Messages
          </Switch>

          <div className="flex flex-row flex-wrap gap-2">
            <SaveChat messages={messages} />
            <LoadChat messages={messages} />
          </div>

          <ConfirmButton
            tooltip="Reset chat history permanently"
            buttonProps={{ fullWidth: true }}
            onConfirm={() => messages.sendAction({ type: "RESET_CHAT" })}
          >
            <FaRecycle /> Reset Chat
          </ConfirmButton>
        </ExpanderItem>
      </Expander>
    </div>
  );
};

export { Sidebar };
