// src/components/modal/index.tsx

"use client"

import { X } from "lucide-react"
import React, { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BaseModalProps {
  open?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
}

const isConfirmationModal = (props: BaseModalProps | ConfirmationModalProps): props is ConfirmationModalProps => {
  return 'title' in props && 'message' in props && 'onConfirm' in props
}

const Modal = (props: BaseModalProps | ConfirmationModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle confirmation modal
  if (isConfirmationModal(props)) {
    const { isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm" } = props

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onCancel()
        }
      }
      if (isOpen) {
        window.addEventListener("keydown", handleKeyDown)
      }
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }, [isOpen, onCancel])

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <Card className="relative w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirm}>
                {confirmText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle base modal
  const { open, onClose, children } = props as BaseModalProps

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export { Modal }
