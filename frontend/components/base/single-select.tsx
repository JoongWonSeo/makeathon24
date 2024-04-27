import React from 'react';
import { Select, SelectProps, SelectItem, SelectSection, Chip } from '@nextui-org/react';

interface Selection {
  value: string;
  label?: string;
  chip?: string;
}

// Define your custom props and extend from SelectProps
interface SingleSelectProps extends Omit<SelectProps, 'children'> {
  selected: string | undefined;
  setSelected: (value: string) => void;
  valList?: string[];
  valGroups?: { [key: string]: Selection[] };
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  selected,
  setSelected,
  valList,
  valGroups,
  classNames,
  ...props // Spread the rest of the props
}) => {
  // Function to handle selection changes
  const handleSelectionChange = (key: any) => {
    setSelected((key as Set<string>).values().next().value);
  };

  // Merge custom class names with defaults
  const mergedClassNames = {
    ...classNames,
    trigger: `${classNames?.trigger || ''}`,
  };

  return (
    <Select
      labelPlacement='inside'
      selectionMode='single'
      disallowEmptySelection={selected ? true : false}
      selectedKeys={selected != undefined ? [selected] : undefined}
      onSelectionChange={handleSelectionChange}
      classNames={mergedClassNames}
      {...props} // Spread the rest of the props to Select
    >
      {
        valList
          ? valList.map((val) => (
            <SelectItem key={val}>{val}</SelectItem>
          ))
          : valGroups
            ? Object.keys(valGroups).map((group) => (
              <SelectSection key={group} title={group}>
                {
                  valGroups[group].map(({ value, label, chip }) => (
                    <SelectItem key={value} value={value} endContent={chip ? <Chip size='sm'>{chip}</Chip> : null}>{label || value}</SelectItem>
                  ))
                }
              </SelectSection>
            ))
            : []
      }
    </Select>
  );
};

export { SingleSelect };
