import { Allotment, LayoutPriority } from "allotment"
import { use, useEffect, useState } from "react"

import { ThemeSwitch } from "../theme-switch"
import { FaBars, FaChevronLeft, FaChevronRight, FaMessage } from "react-icons/fa6"
import { Button, Modal, ModalBody, ModalContent, ScrollShadow } from "@nextui-org/react"


interface SidebarLayoutProps {
  leftSidebar?: React.ReactNode
  children: React.ReactNode
  rightSidebar?: React.ReactNode
}

const SidebarLayout = ({ leftSidebar, children, rightSidebar }: SidebarLayoutProps) => {
  const [isMobile, setIsMobile] = useState(true)
  const [isDualPane, setIsDualPane] = useState(false)

  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true)
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true)


  function handleResize() {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 800)
      setIsDualPane(window.innerWidth < 1000)
    }
  }

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize);
    return () => {
      // remove event listener when the component is unmounted to not cause any memory leaks
      // otherwise the event listener will continue to be active
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  useEffect(() => {
    handleResize()
  }, [isMobile, isDualPane]);

  useEffect(() => {
    if (isDualPane && leftSidebarVisible && rightSidebarVisible) {
      setLeftSidebarVisible(false)
    }
  }, [isDualPane])

  return (
    <div className='w-full h-full'>
      {
        isMobile ?
          <>
            {
              leftSidebar &&
              <>
                <button
                  className="absolute z-50 rounded-xl w-10 h-10 top-4 left-4 text-default-600 flex items-center justify-center border border-default-600 bg-default-50/10 hover:bg-default-50 hover:scale-125 transition backdrop-blur-sm shadow-lg"
                  onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
                >
                  <FaBars />
                </button>

                <Modal
                  className="overflow-hidden bg-default-100"
                  isOpen={leftSidebarVisible}
                  onOpenChange={setLeftSidebarVisible}
                  scrollBehavior="inside"
                  backdrop="blur"
                  placement="bottom"
                  size='full'
                  hideCloseButton
                >
                  <ModalContent>
                    <ModalBody className="p-0">
                      {leftSidebar}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            }

            {children}

            {
              rightSidebar &&
              <>
                <button
                  className="absolute z-50 rounded-xl w-10 h-10 top-4 right-4 text-default-600 flex items-center justify-center border border-default-600 bg-default-50/10 hover:bg-default-50 hover:scale-125 transition backdrop-blur-sm shadow-lg"
                  onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
                >
                  <FaMessage />
                </button>

                <Modal
                  className="overflow-hidden bg-default-100"
                  isOpen={rightSidebarVisible}
                  onOpenChange={setRightSidebarVisible}
                  scrollBehavior="inside"
                  backdrop="blur"
                  placement="bottom"
                  size="full"
                  hideCloseButton
                >
                  <ModalContent>
                    <ModalBody className="p-0">
                      {rightSidebar}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </>
            }
          </>
          :
          <Allotment
            proportionalLayout={false}
            onChange={(sizes: number[]) => {
              if (sizes.length > 0)
                setLeftSidebarVisible(sizes[0] > 0)
              if (sizes.length == 3)
                setRightSidebarVisible(sizes[2] > 0)
            }}
          >

            {/* left side bar */}
            <Allotment.Pane minSize={200} preferredSize={300} snap priority={LayoutPriority.Low} visible={leftSidebarVisible} className="bg-default-100">
              {leftSidebar}
            </Allotment.Pane>

            {/* main editor view */}
            <Allotment.Pane minSize={400} priority={LayoutPriority.High}>
              <button
                className='absolute left-2 top-1/2 -translate-y-1/2 z-50 w-4 h-8 rounded-full text-tiny text-default-600 flex items-center justify-center bg-default-50/10 hover:bg-default-50 hover:scale-125 transition shadow-lg'
                onClick={() => {
                  if (isDualPane && !leftSidebarVisible)
                    setRightSidebarVisible(false)
                  setLeftSidebarVisible(!leftSidebarVisible)
                }}
              >
                {leftSidebarVisible ? <FaChevronLeft /> : <FaChevronRight />}
              </button>

              {children}

              <button
                className='absolute right-2 top-1/2 -translate-y-1/2 z-50 w-4 h-8 rounded-full text-tiny text-default-600 flex items-center justify-center bg-default-50/10 hover:bg-default-50 hover:scale-125 transition shadow-lg '
                onClick={() => {
                  if (isDualPane && !rightSidebarVisible)
                    setLeftSidebarVisible(false)
                  setRightSidebarVisible(!rightSidebarVisible)
                }}
              >
                {rightSidebarVisible ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
            </Allotment.Pane>

            {/* chat view */}
            <Allotment.Pane minSize={400} preferredSize={400} snap priority={LayoutPriority.Normal} visible={rightSidebarVisible}>

              {rightSidebar}

            </Allotment.Pane>
          </Allotment>
      }
    </div>
  )
}

export { SidebarLayout }
