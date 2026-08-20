'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useVerifyCode } from './useVerifyCode'

interface VerifyCodeModalProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

export function VerifyCodeModal({ email, isOpen, onClose }: VerifyCodeModalProps) {
  const {
    code,
    timer,
    error,
    isPending,
    isResending,
    handleClose,
    handleCodeChange,
    handleVerify,
    handleResend,
  } = useVerifyCode({ email, isOpen, onClose })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[380px] p-6 gap-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Подтвердите email
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground break-all">
            Код отправлен на <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}

          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="h-12 text-center font-mono text-xl font-semibold tracking-[0.4em] bg-muted/40 focus:bg-background"
            autoFocus
          />

          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || isPending}
            className="w-full font-medium h-10 transition-all active:scale-[0.98]"
          >
            {isPending ? 'Проверка...' : 'Подтвердить'}
          </Button>

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-muted-foreground">
                Повторный код через {timer} сек
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-medium text-foreground/80 hover:text-foreground underline underline-offset-4 disabled:opacity-50"
              >
                {isResending ? 'Отправка...' : 'Отправить код повторно'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
