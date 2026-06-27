import Button from './Button'

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0B1628] p-5">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <Button className="bg-slate-700 text-slate-100" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}
