import * as React from "react";

export const Select = (props) => <>{props.children}</>;
export const SelectTrigger = (props) => <>{props.children}</>;
export const SelectValue = (props) => <>{props.placeholder}</>;
export const SelectContent = (props) => <>{props.children}</>;
export const SelectItem = (props) => <option value={props.value}>{props.children}</option>;
