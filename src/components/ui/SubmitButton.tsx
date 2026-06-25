'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
  pendingText?: string
}

export function SubmitButton({
  children,
  className,
  pendingText = 'Iniciando sesión…',
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  )
}
