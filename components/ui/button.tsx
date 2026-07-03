import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-heading text-base font-semibold tracking-[0.3px] whitespace-nowrap transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] outline-none select-none hover:scale-[1.02] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-blush to-blush-hover/70 text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:from-blush-hover hover:to-blush-hover hover:shadow-soft-lg",
        outline:
          "border-border-medium bg-background hover:bg-muted hover:text-foreground hover:shadow-soft aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border border-blush bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-blush-light hover:shadow-soft aria-expanded:bg-blush-light",
        accent:
          "bg-gradient-to-b from-warm-yellow to-warm-yellow/80 text-text-primary shadow-soft hover:-translate-y-0.5 hover:to-warm-yellow/60 hover:shadow-soft-lg",
        success:
          "bg-success text-white shadow-soft hover:-translate-y-0.5 hover:opacity-90 hover:shadow-soft-md",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-danger text-white shadow-soft hover:-translate-y-0.5 hover:opacity-90 hover:shadow-soft-md focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:text-blush-hover hover:underline hover:scale-100",
      },
      size: {
        default:
          "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 rounded-[min(var(--radius-md),12px)] px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // Base UI's Button defaults `nativeButton` to true, which asserts the
      // rendered DOM node is a real <button>. Every `render` usage in this
      // codebase swaps in a non-button element (e.g. next/link's <a>), so
      // default `nativeButton` to false whenever `render` is present —
      // otherwise Base UI logs a console error in development. An explicit
      // `nativeButton` prop always wins.
      nativeButton={nativeButton ?? !props.render}
      {...props}
    />
  )
}

export { Button, buttonVariants }
