import { ReactElement } from "react"
import pathMatch from "./pathMatch"
import { RouterContext } from "./RouterContext"
import { Action, BrowserHistory } from "./history"

interface RouterProps {
  history: BrowserHistory & { action: Action }
  children: ReactElement
  location: any
}
/**
 * Router组件,将location,history对象共享到全局
 */
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