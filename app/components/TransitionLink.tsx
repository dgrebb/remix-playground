import { Link, LinkProps, useNavigate } from "@remix-run/react";
import { forwardRef, useCallback } from "react";
import { supportsViewTransitions } from "~/utils/transitions";

/**
 * Link component that triggers view transitions when supported,
 * falls back to CSS-based transitions in other browsers.
 */
const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const navigate = useNavigate();
    const { to, children, onClick, ...rest } = props;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Call the original onClick if provided
        if (onClick) {
          onClick(e);
        }

        // If the event wasn't prevented and View Transitions API is supported
        if (!e.defaultPrevented && supportsViewTransitions) {
          e.preventDefault();

          // @ts-ignore - TypeScript doesn't know about startViewTransition yet
          document.startViewTransition(() => {
            navigate(to);
          });
        }
        // If View Transitions API is not supported, the link will work normally
        // with CSS-based transitions handled by our hooks
      },
      [onClick, navigate, to]
    );

    return (
      <Link
        ref={ref}
        to={to}
        onClick={handleClick}
        {...rest}
        className={`transition-link ${props.className || ""}`}
      >
        {children}
      </Link>
    );
  }
);

TransitionLink.displayName = "TransitionLink";

export default TransitionLink;
