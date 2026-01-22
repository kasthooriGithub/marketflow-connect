import * as React from "react";
import { Form } from "react-bootstrap";
import { cn } from "lib/utils";

const Switch = React.forwardRef(
  ({ className, onCheckedChange, onChange, checked, ...props }, ref) => (
    <Form.Check
      type="switch"
      ref={ref}
      className={cn("fs-4", className)}
      checked={checked}
      onChange={(e) => {
        onChange?.(e);
        onCheckedChange?.(e.target.checked);
      }}
      {...props}
    />
  )
);
Switch.displayName = "Switch";

export { Switch };
