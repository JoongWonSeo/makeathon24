import React, { createContext, useContext, useRef } from 'react';
import { ArrayFieldTemplateProps, ArrayFieldTemplateItemType, FieldTemplateProps, SubmitButtonProps, getSubmitButtonOptions, DescriptionFieldProps, WidgetProps, ObjectFieldTemplateProps, RegistryFieldsType, FieldProps } from '@rjsf/utils';
import { withTheme, ThemeProps } from '@rjsf/core';
import SchemaField from '@rjsf/core/lib/components/fields/SchemaField';
// import ArrayField from '@rjsf/core/lib/components/fields/ArrayField';
import { ReorderArrayField, ReorderArrayFieldTemplateProps } from './reorder-array-field';
import { Button, ButtonGroup, Textarea } from '@nextui-org/react';
import { FaAngleDown, FaAngleUp, FaGripVertical, FaMinus, FaPlus } from 'react-icons/fa6';
import { SingleSelect } from '../base/single-select';
import { toast } from 'sonner';
import { Reorder, useDragControls } from 'framer-motion';


// general field
// const FieldRefContext = createContext<any>(null);

// const RefArrayField = function (props: any) {
//   const fieldRef = useRef<any>(null);
//   return (
//     <FieldRefContext.Provider value={fieldRef}>
//       <ReorderableArrayField ref={fieldRef} {...props} />
//     </FieldRefContext.Provider>
//   );
// };

// class ReorderableArrayField extends ArrayField {
//   getKeyedFormData = () => this.state.keyedFormData;
//   setKeyedFormData = (newKeyedFormData: any[]) => {
//     // let newErrorSchema = {};
//     // for (let key in newKeyedFormData) {
//     //   //find the old index of the item
//     //   // const oldIndex = this.state.keyedFormData.findIndex((x) => x.key === newKeyedFormData[i].key);
//     //   newErrorSchema[key] = this.state.errorSchema[key];
//     // }

//     this.setState(
//       {
//         keyedFormData: newKeyedFormData
//       },
//       () => this.props.onChange(newKeyedFormData.map((x) => x.item)
//         // newErrorSchema as ErrorSchema<T[]>
//       )
//     );
//   }
// }


// entire array field
const ReorderArrayFieldTemplate = ({ items, canAdd, onAddClick, keyedFormData, onReorder, readonly, rawErrors, ...props }: ReorderArrayFieldTemplateProps) => {
  const listContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className=''>
      <div className='text-xs font-bold text-primary/100 mb-1 mt-4'>
        {props.title}
      </div>
      <div className='flex flex-col gap-1 pl-2 border-l-1 border-primary/100'>
        <div ref={listContainerRef}>
          {
            keyedFormData && !readonly && keyedFormData && onReorder
              ? <Reorder.Group axis='y' values={keyedFormData} onReorder={onReorder}>
                {
                  keyedFormData.map((keyedData) => {
                    const { key } = keyedData;
                    const p = items.filter((x) => x.key === key)[0];

                    return <DraggableItem keyedData={keyedData} containerRef={listContainerRef} {...p} key={key} />
                  })
                }
              </Reorder.Group>
              : items.map((p) => <ArrayFieldItemTemplate {...p} key={p.key} />)
          }
        </div>
        {/* <Button onClick={()=>onChange(props.formData.splice(0, 1))}>Remove</Button> */}
        {
          canAdd && !readonly &&
          <Button fullWidth size='sm' onClick={onAddClick} >
            <FaPlus />
          </Button>
        }
        {
          (rawErrors?.length ?? 0) > 0 &&
          <div className='text-red-500'>
            {JSON.stringify(rawErrors)}
          </div>
        }
      </div>
    </div>
  );
}

const DraggableItem = ({ keyedData, containerRef, ...p }: any) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      layout='position'
      value={keyedData}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={containerRef}
      dragElastic={0.3}
    >
      <div className='flex flex-row items-stretch'>
        <div
          className='px-1 flex items-center bg-default rounded-lg my-1 pr-1 mr-1'
          onPointerDown={(e) => {
            // prevent drag
            e.preventDefault();
            dragControls.start(e)
          }}>
          <FaGripVertical />
        </div>
        <div className='w-full'>
          <ArrayFieldItemTemplate {...p} />
        </div>
      </div>
    </Reorder.Item>
  )
}

// single array item
function ArrayFieldItemTemplate({ children, className, hasMoveUp, hasMoveDown, hasRemove, readonly, ...props }: ArrayFieldTemplateItemType) {
  return (
    <div className='flex flex-row gap-1 items-center justify-between'>
      <div className='grow [&_.control-label]:hidden'>
        {children}
      </div>

      {!readonly &&
        <Button isIconOnly size='sm' isDisabled={!hasRemove || readonly} onClick={props.onDropIndexClick(props.index)}>
          <FaMinus />
        </Button>
      }
    </div>
  )
}

function FieldTemplate(props: FieldTemplateProps) {
  const { id, classNames, style, label, help, required, description, errors, children } = props;
  return (
    <div className='' style={style}>
      {/* <div className='text-red-500'>
        {label}
        {required ? '[*]' : null}
      </div> */}
      {description}
      <div className=''>
        {children}
      </div>
      {errors}
      {help}
    </div>
  );
}

function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  // const titleCase = (s: string) =>
  //   s.replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())       // Initial char (after -/_)
  //     .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase()) // First char after each -/_
  const removeUnderscore = (s: string) => s.replace(/_/g, ' ');

  return (
    <div>
      {/* {props.title} */}
      {/* {props.description} */}
      {
        props.properties.map((element, i) => (
          <div key={i}>
            <div className='text-xs font-bold text-primary/100 mb-1'>
              {
                // titleCase(element.name)
                // removeUnderscore(element.name)
              }
            </div>
            {
              props.title != "ActivityPrompt" &&
              element.content
            }
          </div>
        ))
      }
    </div>
  );
}

function DescriptionFieldTemplate(props: DescriptionFieldProps) {
  const { description, id } = props;
  return (
    // description &&
    // <Tooltip content={description}>
    //   <button>
    //     <FaCircleInfo />
    //   </button>
    // </Tooltip>
    null
  );
}

function SubmitButton(props: SubmitButtonProps) {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <Button type='submit' color='primary' className='mt-4'>
      Validate
    </Button>
  );
}

const SelectWidget = ({ id, label, placeholder, required, value, readonly, onChange, options, ...props }: WidgetProps) => {
  const showLabel = !label.includes('_') && label.charAt(0).toLowerCase() !== label.charAt(0) && label != "[HIDE]";
  const pl = showLabel ? props.schema.description || label : label;
  const showPlaceholder = pl && !('0' <= label.slice(-1) && label.slice(-1) <= '9');

  return (
    <>
      {showLabel && (
        <div className='text-xs font-bold text-primary/100 mb-1 mt-4'>
          {label}
        </div>
      )}
      {
        label != "[HIDE]" &&
        <SingleSelect
          id={id}
          aria-label={label}
          placeholder={showPlaceholder ? pl.replace(/_/g, ' ') : undefined}
          isRequired={required}
          isDisabled={readonly}
          selected={value}
          setSelected={onChange}
          valList={options.enumOptions?.map((item) => item.value) || []}
          isMultiline
          disallowEmptySelection={false}
        />
      }
    </>
  );
};

const TextWidget = ({ id, label, placeholder, required, value, readonly, onChange, rawErrors, ...props }: WidgetProps) => {
  const showLabel = !label.includes('_') && label.charAt(0).toLowerCase() !== label.charAt(0) && label != "[HIDE]";
  const pl = showLabel ? props.schema.description || label : label;
  const showPlaceholder = pl && !('0' <= label.slice(-1) && label.slice(-1) <= '9');

  return (
    <>
      {showLabel && (
        <div className='text-xs font-bold text-primary/100 mb-1 mt-4'>
          {label}
          { }
        </div>
      )}
      {
        label != "[HIDE]" &&
        <Textarea
          id={id}
          aria-label={label}
          isRequired={required}
          value={value}
          placeholder={showPlaceholder ? pl.replace(/_/g, ' ') : undefined}
          isDisabled={readonly}
          onChange={(e) => onChange(e.target.value)}
          minRows={1}
          maxRows={10}
          isInvalid={(rawErrors?.length ?? 0) > 0}
          errorMessage={rawErrors}
        />
      }
    </>
  );
}


const theme: ThemeProps = {
  fields: {
    // SchemaField: CustomSchemaField,
    ArrayField: ReorderArrayField,
  },
  widgets: {
    SelectWidget,
    TextWidget
  },
  templates: {
    ArrayFieldTemplate: ReorderArrayFieldTemplate,
    FieldTemplate,
    ObjectFieldTemplate,
    DescriptionFieldTemplate,
    ButtonTemplates: {
      SubmitButton,
    }
  }
};

export const Form = withTheme(theme);
