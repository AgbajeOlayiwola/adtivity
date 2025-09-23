// src/components/ui/modal.tsx

"use client"

import { X } from "lucide-react"
import React, { useEffect, useRef } from "react"

interface ModalProps {
  isOpen: boolean
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal = ({ isOpen, open, onClose, children }: any) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when pressing the Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  // Click handler for the backdrop to close the modal
  //   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //     if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
  //       onClose()
  //     }
  //   }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      //   onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

export { Modal }
