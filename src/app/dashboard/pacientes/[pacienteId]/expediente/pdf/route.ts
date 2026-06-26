import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getExpedienteData } from '../actions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pacienteId: string }> }
): Promise<NextResponse> {
  const { pacienteId } = await params
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return new NextResponse('No autorizado', { status: 401 })
  }

  const data = await getExpedienteData(pacienteId)
  if (!data.paciente) {
    return new NextResponse('Paciente no encontrado', { status: 404 })
  }

  const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  let pdfBuffer: Buffer
  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { ExpedienteCompletoPDF } = await import('@/lib/pdf/ExpedienteCompletoPDF')
    const React = await import('react')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfBuffer = await renderToBuffer(React.createElement(ExpedienteCompletoPDF, {
      ...data,
      paciente: data.paciente,
      fechaGeneracion,
    }) as any)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    return new NextResponse(`Error al generar el PDF: ${msg}`, { status: 500 })
  }

  const nombreArchivo = `expediente-${data.paciente.numero_expediente}-${new Date().toISOString().split('T')[0]}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
      'Cache-Control': 'no-store',
    },
  })
}
