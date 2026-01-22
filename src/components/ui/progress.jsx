import * as React from "react";
import { ProgressBar } from "react-bootstrap";

const Progress = React.forwardRef(
  ({ className, value, ...props }, ref) => (
    <ProgressBar
      now={value || 0}
      className={className}
      {...props}
    />
  )
);
Progress.displayName = "Progress";

export { Progress };
