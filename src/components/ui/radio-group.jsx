import * as React from "react";
import { Form } from "react-bootstrap";
import { cn } from "lib/utils";

const RadioGroup = React.forwardRef(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div className={cn("d-flex flex-column gap-2", className)} {...props} ref={ref}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return child;
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <Form.Check
        type="radio"
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
