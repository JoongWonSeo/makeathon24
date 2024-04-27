import React, { forwardRef } from 'react';
import { Accordion, AccordionProps, AccordionItem, AccordionItemProps } from '@nextui-org/react';
import { mergeClassNames } from '@/components/utils';

type ExpanderProps = AccordionProps & {
  color?: string;
};

const Expander: React.FC<ExpanderProps> = forwardRef(function Expander({
  selectionMode = 'multiple',
  defaultExpandedKeys = [],
  variant = 'shadow',
  color = undefined,
  showDivider = false,
  className = '',
  itemClasses = {},
  children,
  id,
  ...props
}, ref) {
  const backgroundColor = color ? `bg-${color}` : 'bg-default-50';
  const titleColor = color ? `text-${color}-foreground` : 'text-primary/100';
  const contentColor = color ? `text-${color}-foreground` : 'text-default-foreground';

  return (
    <Accordion
      id={id}
      ref={ref}
      selectionMode={selectionMode}
      defaultExpandedKeys={defaultExpandedKeys}
      variant={variant}
      showDivider={showDivider}
      className={`p-2 flex flex-col gap-1 w-full ${backgroundColor} ${className}`}
      itemClasses={mergeClassNames({
        base: 'py-0 w-full',
        title: `font-normal text-medium ${titleColor}`,
        trigger: 'px-2 py-0 hover:bg-default-200 rounded-lg min-h-12 flex items-center',
        indicator: `text-medium ${titleColor}`,
        content: `text-small ${contentColor} px-2 py-2 flex flex-col gap-2`,
      }, itemClasses as any)}
      {...props}
    >
      {children}
    </Accordion>
  );
});

export { Expander, AccordionItem as ExpanderItem }
