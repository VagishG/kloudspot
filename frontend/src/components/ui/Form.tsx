import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface FieldWrapperProps {
  label: string
  error?: string
  hint?: string
  htmlFor: string
  children: ReactNode
}

export function FieldWrapper({ label, error, hint, htmlFor, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn('field-input', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/15', className)}
        {...rest}
      />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  placeholder?: string
}

export function Select({ label, error, className, id, placeholder, children, ...rest }: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <FieldWrapper label={label} error={error} htmlFor={selectId}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'field-input appearance-none bg-no-repeat',
          'bg-[position:right_0.6rem_center] bg-[size:1rem]',
          'pr-8',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/15',
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </FieldWrapper>
  )
}
