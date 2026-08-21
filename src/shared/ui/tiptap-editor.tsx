'use client'

import { useEditor, useEditorState, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BubbleMenu } from '@tiptap/react/menus'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link2,
  Link2Off,
  Check,
  Loader2,
  Paperclip,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { useRef, useState } from 'react'
import { Input } from './input'
import { toast } from 'sonner'

interface TiptapEditorProps {
  value?: JSONContent | null
  onChange?: (json: JSONContent) => void
  onUpload?: (formData: FormData) => Promise<{ url?: string; name?: string; size?: string; error?: string }>
  placeholder?: string
  className?: string
  editable?: boolean
}

export function TiptapEditor({
  value,
  onChange,
  onUpload,
  placeholder,
  className,
  editable = true,
}: TiptapEditorProps) {

  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const submitLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const href = linkUrl.startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }

  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    // чтобы можно было выбрать тот же файл повторно
    e.target.value = ''

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      if (!onUpload) return
      const res = await onUpload(formData)
      if (res?.error) {
        toast.error(res.error)
        return
      }

      if (res?.url) {
        if (file.type.startsWith('image/')) {
          // вставляем изображение
          editor.chain().focus().setImage({ src: res.url, alt: res.name }).run()
        } else if (file.type === 'application/pdf') {
          // вставляем PDF как ссылку с иконкой
          editor.chain().focus()
            .insertContent(
              `<p><a href="${res.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted border border-border text-xs font-medium text-foreground transition-colors no-underline">📄 <span>${res.name}</span> <span class="text-muted-foreground text-[10px]">(${res.size} МБ)</span></a></p>`
            )
            .run()
        }
        toast.success('Файл успешно прикреплен')
      }
    } catch (err) {
      console.error(err)
      toast.error('Не удалось загрузить файл')
    } finally {
      setIsUploading(false)
    }
  }



  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Добавьте описание...' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline underline-offset-2 cursor-pointer' } }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-2 border border-border/50' },
      }),
    ],
    content: typeof value === 'string'
      ? JSON.parse(value)
      : (value ?? undefined),
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  const activeStates = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive('bold') ?? false,
      italic: ctx.editor?.isActive('italic') ?? false,
      strike: ctx.editor?.isActive('strike') ?? false,
      code: ctx.editor?.isActive('code') ?? false,
      h1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
      h2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
      h3: ctx.editor?.isActive('heading', { level: 3 }) ?? false,
      bulletList: ctx.editor?.isActive('bulletList') ?? false,
      orderedList: ctx.editor?.isActive('orderedList') ?? false,
      blockquote: ctx.editor?.isActive('blockquote') ?? false,
      link: ctx.editor?.isActive('link') ?? false,
    }),
  })

  if (!editor) return null

  const tools = [
    { title: 'Жирный', icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: activeStates.bold },
    { title: 'Курсив', icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: activeStates.italic },
    { title: 'Зачёркнутый', icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: activeStates.strike },
    { title: 'Код', icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: activeStates.code },
    null,
    { title: 'H1', icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: activeStates.h1 },
    { title: 'H2', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: activeStates.h2 },
    { title: 'H3', icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: activeStates.h3 },
    null,
    { title: 'Список', icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: activeStates.bulletList },
    { title: 'Нумерация', icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: activeStates.orderedList },
    { title: 'Цитата', icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: activeStates.blockquote },
    { title: 'Разделитель', icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
  ]


  return (
    <div className={cn('rounded-xl border bg-card/40 border-muted-foreground/20 overflow-hidden', className)}>
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-muted-foreground/10 bg-muted/20">
          {tools.map((tool, i) =>
            tool === null ? (
              <div key={i} className="w-px h-4 bg-border mx-1" />
            ) : (
              <Button
                key={tool.title}
                type="button"
                variant="ghost"
                size="icon"
                title={tool.title}
                onMouseDown={(e) => { e.preventDefault(); tool.action() }}
                className={cn('h-7 w-7', tool.active && 'bg-muted text-foreground')}
              >
                <tool.icon className="h-3.5 w-3.5" />
              </Button>
            )
          )}
          {onUpload && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf"
                className="hidden"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Прикрепить файл или фото (до 10 МБ)"
                disabled={isUploading}
                onMouseDown={(e) => {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }}
                className="h-7 w-7"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
      {editable && (
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          shouldShow={({ editor }) => {
            // скрываем для изображений
            if (editor.isActive('image')) return false
            // скрываем для прикрепленных PDF файлов
            const href = editor.getAttributes('link').href as string | undefined
            if (href?.toLowerCase().endsWith('.pdf')) return false

            // только если выделен текст
            return !editor.state.selection.empty
          }}
          className="flex items-center gap-0.5 rounded-lg border border-border bg-popover/95 backdrop-blur shadow-md px-1.5 py-1 z-50"
        >
          {!showLinkInput ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', activeStates.bold && 'bg-muted')}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', activeStates.italic && 'bg-muted')}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', activeStates.strike && 'bg-muted')}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Button>

              <div className="w-px h-4 bg-border mx-0.5" />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', activeStates.link && 'bg-muted text-primary')}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setLinkUrl(editor.getAttributes('link').href ?? '')
                  setShowLinkInput(true)
                }}
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="h-7 w-36 sm:w-48 text-xs px-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitLink()
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                title="Применить"
                onMouseDown={(e) => {
                  e.preventDefault()
                  submitLink()
                }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              {activeStates.link && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Удалить ссылку"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    editor.chain().focus().unsetLink().run()
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }}
                >
                  <Link2Off className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </BubbleMenu>
      )}
    </div>
  )
}