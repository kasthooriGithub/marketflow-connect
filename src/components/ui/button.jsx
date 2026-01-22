import * as React from "react";
import { Button as BootstrapButton } from "react-bootstrap";

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}, ref) => {

  // Map old variants to Bootstrap variants or classes
  let bsVariant = "primary";
  let extraClasses = "";

  switch (variant) {
    case 'default': bsVariant = 'primary'; break;
    case 'destructive': bsVariant = 'danger'; break;
    case 'outline': bsVariant = 'outline-primary'; break;
    case 'secondary': bsVariant = 'secondary'; break;
    case 'ghost': bsVariant = 'link'; extraClasses = "text-decoration-none text-muted"; break;
    case 'link': bsVariant = 'link'; break;
    case 'gradient': bsVariant = 'primary'; extraClasses = "bg-gradient-primary"; break;
    case 'hero': bsVariant = 'primary'; extraClasses = "btn-lg fw-bold shadow"; break;
    case 'hero-outline': bsVariant = 'outline-light'; extraClasses = "btn-lg fw-bold"; break;
    case 'accent': bsVariant = 'info'; break;
    default: bsVariant = variant;
  }

  // Map sizes
  let bsSize;
  if (size === 'sm') bsSize = 'sm';
  if (size === 'lg' || size === 'xl') bsSize = 'lg';
  if (size === 'icon') extraClasses += " p-2 d-inline-flex align-items-center justify-content-center";

  return (
    <BootstrapButton
      ref={ref}
      variant={bsVariant}
      size={bsSize}
      className={`${extraClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
});

Button.displayName = "Button";

export { Button };
