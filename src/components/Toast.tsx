import { AnimatePresence, motion } from 'motion/react'

export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="toast-enter fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-[2px] bg-[var(--ink)] px-3.5 py-2 font-sans text-[12.5px] text-[var(--ink-inverse)] shadow-[var(--shadow-raised)]"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
