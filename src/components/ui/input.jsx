import * as React from "react";
import { Form } from "react-bootstrap";

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <Form.Control
        type={type}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
