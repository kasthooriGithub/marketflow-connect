import * as React from "react";
import { Tab, Nav } from "react-bootstrap";

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => (
  <Tab.Container
    defaultActiveKey={defaultValue}
    activeKey={value}
    onSelect={(k) => onValueChange && onValueChange(k)}
    {...props}
  >
    <div className={className}>{children}</div>
  </Tab.Container>
);

const TabsList = ({ className, children, ...props }) => (
  <Nav className={`nav-pills bg-light rounded p-1 ${className || ''}`} {...props}>
    {children}
  </Nav>
);

const TabsTrigger = ({ value, className, children, ...props }) => (
  <Nav.Item>
    <Nav.Link eventKey={value} className={`text-reset ${className || ''}`} {...props}>
      {children}
    </Nav.Link>
  </Nav.Item>
);

const TabsContent = ({ value, className, children, ...props }) => (
  <Tab.Content className={className} {...props}>
    <Tab.Pane eventKey={value}>
      {children}
    </Tab.Pane>
  </Tab.Content>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
