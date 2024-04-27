// import { Divider, Tooltip } from "@nextui-org/react"
// import { useMemo } from "react"
// import { FaCircleXmark } from "react-icons/fa6"

// type OpenItemProps = {
//   id: string,
//   title: string,
//   icon: JSX.Element,
//   isOpen: boolean,
//   onOpenChange: (isOpen: boolean) => void,
//   onFocus: () => void,
// }

// const OpenItem = ({ id, title, icon, isOpen, onOpenChange, onFocus }: OpenItemProps) => (
//   <div
//     key={id}
//     className='flex flex-row gap-1 items-center w-full'
//   >
//     <div className='flex-none'>
//       {icon}
//     </div>

//     <button
//       className={`truncate text-sm ${isOpen ? 'bg-default' : ''}`}
//       onClick={() => {
//         onOpenChange(true)
//         onFocus()
//       }}
//     >
//       {title}
//     </button>

//     <div className='flex-grow' />

//     {isOpen
//       ?
//       <Tooltip content="Close">
//         <button
//           onClick={() => onOpenChange(false)}
//         >
//           <FaCircleXmark />
//         </button>
//       </Tooltip>
//       : null
//     }
//   </div>
// )

// type openItemFactory = (props: {
//   id: string,
//   isOpen: boolean,
//   onOpenChange: (isOpen: boolean) => void,
// }) => JSX.Element

// type OpenListSectionProps = {
//   title: string,
//   opened: string[]
//   onOpenedChange: (opened: string[]) => void
//   itemFactories: Record<string, openItemFactory>
// }

// const OpenListSection = ({ title, opened, onOpenedChange, itemFactories }: OpenListSectionProps) => {
//   const openedIdSet = useMemo(() => new Set(opened), [opened])

//   return (
//     <div
//       className='flex flex-col p-2 gap-2'
//     >
//       <div className='text-tiny text-foreground-500 pl-5'>
//         {title}
//       </div>

//       {
//         Object.entries(itemFactories).map(([id, ItemFactory]) => (
//           <ItemFactory
//             id={id}
//             isOpen={openedIdSet.has(id)}
//             onOpenChange={(isOpen) => {
//               if (isOpen) {
//                 onOpenedChange([...opened, id])
//               } else {
//                 onOpenedChange(opened.filter((key) => key != id))
//               }
//             }}
//           />
//         ))
//       }

//       <Divider />
//     </div>
//   )
// }

// export { OpenItem, OpenListSection }
