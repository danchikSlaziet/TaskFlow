import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getCurrentUser } from '@/entities/user/index.server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // проверка авторизации
  const user = await getCurrentUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { filename } = await params

  // отсекаем попытки выйти за пределы папки через ../
  const safeFilename = path.basename(filename)
  const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename)

  try {
    const fileBuffer = await readFile(filePath)

    // определение MIME-типа
    const ext = path.extname(safeFilename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
      '.pdf': 'application/pdf',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error(err)
    return new NextResponse('File not found', { status: 404 })
  }
}