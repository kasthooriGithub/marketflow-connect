import * as React from "react";
import { Modal } from "react-bootstrap";

const Dialog = ({ open, onOpenChange, children, ...props }) => {
  return (
    <Modal show={open} onHide={() => onOpenChange(false)} {...props} centered>
      {children}
    </Modal>
  )
};

const DialogContent = ({ children, className, ...props }) => {
  return <>{children}</>;
};

const DialogHeader = ({ className, ...props }) => (
  <Modal.Header closeButton className={className} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <Modal.Title className={className} {...props} />
);

const DialogDescription = ({ className, ...props }) => (
  <div className={`text-muted small ${className || ''}`} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <Modal.Footer className={className} {...props} />
);

const DialogTrigger = ({ asChild, children, ...props }) => {
  return <>{children}</>;
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
};
