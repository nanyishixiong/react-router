import React from "react";
import { BrowserHistory } from "./history";
import { PathMatch } from "./pathMatch";

export interface ContextProps {
  match: PathMatch,
  location: BrowserHistory['location'],
  history: BrowserHistory,
}

export const RouterContext = React.createContext<ContextProps>(null!)

