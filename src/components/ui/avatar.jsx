import * as React from "react";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`d-flex align-items-center justify-content-center rounded-circle overflow-hidden position-relative bg-secondary bg-opacity-10 ${className || ''}`}
    style={{ width: '40px', height: '40px', ...props.style }}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={`w-100 h-100 object-fit-cover ${className || ''}`}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`d-flex align-items-center justify-content-center w-100 h-100 bg-secondary text-white ${className || ''}`}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
