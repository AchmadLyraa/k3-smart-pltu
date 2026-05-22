'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Tentukan ikon berdasarkan variant
        let Icon = Info
        let iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-full'
        
        if (variant === 'success') {
          Icon = CheckCircle2
          iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-full'
        } else if (variant === 'destructive') {
          Icon = AlertCircle
          iconColor = 'text-red-500 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-full'
        } else if (variant === 'warning') {
          Icon = AlertTriangle
          iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-full'
        } else if (variant === 'theme') {
          Icon = CheckCircle2
          iconColor = 'text-[#FF4B4B] bg-red-50 dark:bg-red-950/40 p-1.5 rounded-full'
        }

        return (
          <Toast
            key={id}
            variant={variant}
            className="overflow-hidden border border-slate-100/80 dark:border-slate-800/80 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 pr-10 flex gap-3 items-start transition-all"
            {...props}
          >
            <div className="flex gap-3 w-full">
              <div className={`${iconColor} mt-0.5 shrink-0`}>
                <Icon className="h-5 w-5 animate-pulse" />
              </div>
              <div className="grid gap-1 flex-1 min-w-0">
                {title && (
                  <ToastTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
