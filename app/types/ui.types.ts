import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from '~/components/ui/button'

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean
}
