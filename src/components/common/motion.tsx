import { animate, motion, useInView, type HTMLMotionProps } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
} as const

export function Stagger({ children, className, delay = 0, ...rest }: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function Item({ children, className, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  )
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 140, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(format(0))
  const prev = useRef(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(prev.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format(v)),
    })
    prev.current = value
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView])
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  )
}
