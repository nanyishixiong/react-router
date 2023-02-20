import { ReactElement } from "react"
import pathMatch from "./pathMatch"
import { RouterContext } from "./RouterContext"
import { Action, BrowserHistory } from "./history"

interface RouterProps {
  history: BrowserHistory & { action: Action }
  children: ReactElement
  location: any
}

export const Router = ({ location, history, children }: RouterProps) => {
  const match = pathMatch("/", history.location.pathname)

  return (
    <RouterContext.Provider
      value={{
        match,
        location: location,
        history: history,
      }}>
      {children}
    </RouterContext.Provider>
  )
}