import React, { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface CustomPopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  hoverDelay?: number;
  hideDelay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
}

export function CustomPopover({
  trigger,
  content,
  hoverDelay = 1500,
  hideDelay = 1500,
  side = "right",
  align = "start",
  sideOffset = 20,
  alignOffset = -50,
}: CustomPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Set a timeout to open the popover after hoverDelay
    if (!isOpen && !isPinned) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // If not pinned, set a timeout to close the popover after hideDelay
    if (isOpen && !isPinned) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, hideDelay);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up

    // Toggle pinned state
    if (isOpen && isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsPinned(true);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsPinned(false);
    setIsOpen(false);
  };

  // Custom handler for popover state changes
  const handleOpenChange = (open: boolean) => {
    // Only allow the popover to close if it's not pinned
    if (!isPinned || open) {
      setIsOpen(open);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div onClick={handleClick}>{trigger}</div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4 z-50"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative">
            {/* Close button */}
            {isPinned && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={handleClose}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Close</span>
              </Button>
            )}

            {/* Content */}
            {content}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
