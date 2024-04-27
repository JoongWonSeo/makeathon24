import { Tooltip as OriginalTooltip, TooltipProps } from "@nextui-org/react";

const Tooltip = (props: TooltipProps) => (
  <OriginalTooltip showArrow closeDelay={100} classNames={{ base: "pointer-events-none" }} {...props} />
);

export { Tooltip };
export type { TooltipProps };
