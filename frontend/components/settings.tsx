import { Button, ButtonGroup, Divider, Slider } from "@nextui-org/react";
import { FaGear, FaClapperboard, FaFileArrowUp } from "react-icons/fa6";
import { PopTooltip, ConfirmButton } from "./base/confirm-button";
import { MD } from "./base/md";
import { ThemeSwitch } from "./theme-switch";
import { toast } from "sonner";
import { useState } from "react";

const LoadRecordings = ({ gpt }: { gpt: any }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <PopTooltip
      className='grow'
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      popoverProps={{
        backdrop: "blur"
      }}
      trigger={
        <Button fullWidth>
          Load
        </Button>
      }
    >
      <div className="px-1 py-2">
        <div className="text-small font-bold pb-3">
          Load Recordings
        </div>
        <div className="text-danger font-bold pb-3">
          {`Warning: Your current recordings will be overwritten!`}
        </div>
        <input
          type="file"
          onChange={
            (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const buffer = e.target?.result
                  if (buffer) {
                    try {
                      gpt.sendBinary({ type: "IMPORT_RECORDINGS" }, buffer)
                    } catch (e) {
                      toast.error(`Error loading recordings: ${e}`)
                    } finally {
                      setIsOpen(false)
                    }
                  }
                }
                reader.readAsArrayBuffer(file)
              }
            }
          }
        />
      </div>
    </PopTooltip>
  )
}


interface SettingsProps {
  gpt: any;
}

const Settings = ({ gpt }: SettingsProps) => {
  return (
    <PopTooltip
      tooltip='Settings'
      trigger={
        <Button isIconOnly>
          <FaGear />
        </Button>
      }
    >
      <div className='p-1 flex flex-col gap-2'>
        <p className='font-bold text-large'>Settings</p>

        <Divider />

        <p className='font-bold'>Model Recordings</p>
        <ConfirmButton
          tooltip='Record a model response'
          warning={
            <MD className='max-w-xs'>
              {`
This will "record" the raw model response for your prompts until you stop recording. Then, it will be selectable as a "model" with name \`replay:i\` which will then simply replay the exact responses in the order they came in, looping forever!

This is really useful for debugging and testing, to avoid wasting tokens! So nice, right?
`
              }
            </MD>
          }
          buttonProps={{ fullWidth: true, color: 'primary' }}
          onConfirm={
            () => {
              gpt.sendAction({
                type: gpt.isRecording ? "RECORDING_STOP" : "RECORDING_START"
              });
            }
          }
        >
          <FaClapperboard /> {gpt.isRecording ? "Stop" : "Start"} Recording
        </ConfirmButton>
        <Slider
          label="Replay Speed"
          getValue={(s: any) => `x${2 ** s}`}
          minValue={-3}
          maxValue={3}
          defaultValue={0}
          step={1}
          fillOffset={0}
          showSteps
        />
        <div className='flex'>
          <ButtonGroup>
            <Button
              onPress={() => {
                gpt.sendAction({ type: "EXPORT_RECORDINGS" })
              }}
            >
              Save
            </Button>
            <LoadRecordings gpt={gpt} />
          </ButtonGroup>
        </div>

        <Divider />

        <p className='font-bold'>Theme</p>
        <ThemeSwitch />
      </div>

    </PopTooltip>
  )
}

export { Settings }
