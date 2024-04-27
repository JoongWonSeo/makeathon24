import { Button, Popover, PopoverContent, PopoverProps, PopoverTrigger } from "@nextui-org/react"
import { Tooltip, TooltipProps } from "./tooltip"
import { useState } from "react"


interface PopTooltipProps {
  trigger: React.ReactNode
  tooltip?: string
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
  popoverProps?: Omit<PopoverProps, 'children'>
  tooltipProps?: TooltipProps
  className?: string
}

const PopTooltip = ({ trigger, tooltip, isOpen, setIsOpen, children, popoverProps, tooltipProps, className }: PopTooltipProps) => {
  return (
    <Popover showArrow isOpen={isOpen} onOpenChange={setIsOpen} {...popoverProps}>
      {
        tooltip
          ? <Tooltip content={tooltip} {...tooltipProps}>
            <div className={`max-w-full ${className}`}> {/* https://github.com/nextui-org/nextui/issues/1265#issuecomment-1666527084 */}
              <PopoverTrigger>
                {trigger}
              </PopoverTrigger>
            </div>
          </Tooltip>
          : <PopoverTrigger>
            {trigger}
          </PopoverTrigger>
      }
      <PopoverContent>
        {children}
      </PopoverContent>
    </Popover >
  );
}


interface ConfirmButtonProps {
  onConfirm: () => void
  tooltip?: string
  warning?: React.ReactNode
  confirm?: React.ReactNode
  buttonProps?: React.ComponentProps<typeof Button>
  confirmProps?: React.ComponentProps<typeof Button>
  children: React.ReactNode
}

const ConfirmButton = ({ onConfirm, tooltip, warning, confirm = "Confirm", buttonProps, confirmProps, children }: ConfirmButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <PopTooltip
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      tooltip={tooltip}
      trigger={<Button {...buttonProps}>{children}</Button>}
    >
      <div className="px-1 py-2 flex flex-col gap-2">
        {warning || tooltip && <div className="mb-3 max-w-xs font-bold">{tooltip}</div>}
        <Button
          color='primary'
          onPress={() => {
            setIsOpen(false)
            onConfirm()
          }}
          {...confirmProps}
        >
          {confirm}
        </Button>
      </div>
    </PopTooltip >
  )
}



export { PopTooltip, ConfirmButton }
