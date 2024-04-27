import { toast } from 'sonner';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { Tooltip } from './tooltip';

interface CopyTextProps {
  text: string
  tooltip?: string
  successMessage?: string
  className?: string
}

const CopyText = ({ text, tooltip = "Click to Copy", successMessage = 'Copied to Clipboard!', className }: CopyTextProps) => {
  const [copied, toClipboard] = useCopyToClipboard()

  return (
    <Tooltip content={tooltip}>
      <button
        onClick={() => {
          toClipboard(text)
          toast.success(successMessage)
        }}
        className={`hover:text-primary/100 transition duration-500 ${className}`}
      >
        {text}
      </button>
    </Tooltip>
  )
}

export { CopyText }
