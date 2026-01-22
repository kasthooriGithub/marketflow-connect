import * as React from "react";
import { Badge as BootstrapBadge } from "react-bootstrap";

function Badge({ className, variant = "default", ...props }) {
  let bg = "primary";
  let text = "light";
  let extraClasses = "";

  switch (variant) {
    case "default":
      bg = "primary";
      break;
    case "secondary":
      bg = "secondary";
      break;
    case "destructive":
      bg = "danger";
      break;
    case "outline":
      bg = "transparent";
      text = "dark";
      extraClasses = "border border-secondary text-dark";
      break;
    default:
      bg = variant;
  }

  if (variant === 'outline') {
    return (
      <span className={`badge rounded-pill fw-normal ${extraClasses} ${className || ''}`} {...props} />
    )
  }

  return (
    <BootstrapBadge
      bg={bg}
      text={text}
      className={`rounded-pill fw-normal ${className || ''}`}
      {...props}
    />
  );
}

export { Badge };
