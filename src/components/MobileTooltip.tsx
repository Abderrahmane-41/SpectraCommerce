import React, { useState, useEffect, useRef } from 'react';
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface MobileTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function MobileTooltip({
  content,
  children,
  className = "",
}: MobileTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Detect if we're on a touch device
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0
  );

  useEffect(() => {
    // Handle clicks outside to close the tooltip
    function handleOutsideClick(e: MouseEvent) {
      if (
        isOpen && 
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen]);

  // Handle touch and mouse interactions differently
  const handleTriggerInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isTouchDevice) {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        onClick={handleTriggerInteraction}
        aria-expanded={isOpen}
      >
        {children}
      </button>
      
      {/* Show tooltip when open on mobile */}
      {(isOpen || !isTouchDevice) && (
        <TooltipPrimitive.Provider delayDuration={0}>
          <TooltipPrimitive.Root 
            open={isTouchDevice ? isOpen : undefined} 
            onOpenChange={isTouchDevice ? undefined : setIsOpen}
          >
            <TooltipPrimitive.Trigger asChild>
              <span className="absolute inset-0 opacity-0" />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                align="center"
                sideOffset={5}
                className={cn(
                  "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md touch-tooltip-animation",
                  className
                )}
              >
                {content}
                <TooltipPrimitive.Arrow className="fill-popover" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </div>
  );
}