
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-red-200 via-gray-200 to-emerald-200">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-red-500 to-emerald-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-7 w-7 rounded-full border-4 border-white bg-[#4729A3] shadow-lg ring-2 ring-[#4729A3]/30 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4729A3]/50 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
