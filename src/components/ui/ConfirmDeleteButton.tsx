'use client'

import { useRef } from 'react'
import styles from '@/app/dashboard/pacientes/pacientes.module.css'

interface Props {
  action: (formData: FormData) => Promise<void>
  fileName: string
}

export function ConfirmDeleteButton({ action, fileName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  return (
    <>
      <button type="button" onClick={openDialog} className={styles.btnInlineDanger}>
        Eliminar
      </button>
      <dialog ref={dialogRef} className={styles.confirmDialog}>
        <p className={styles.confirmMessage}>
          ¿Eliminar <strong>{fileName}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className={styles.confirmActions}>
          <button type="button" onClick={closeDialog} className={styles.btnGhost}>
            Cancelar
          </button>
          <form action={action}>
            <button type="submit" className={styles.btnDanger}>
              Eliminar definitivamente
            </button>
          </form>
        </div>
      </dialog>
    </>
  )
}
