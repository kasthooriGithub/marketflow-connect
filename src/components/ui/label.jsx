import * as React from "react";
import { Form } from "react-bootstrap";

const Label = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Form.Label ref={ref} className={`fw-medium small ${className || ''}`} {...props} />
  )
);

Label.displayName = "Label";

export { Label };
