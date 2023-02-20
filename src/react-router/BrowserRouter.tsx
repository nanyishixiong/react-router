import { ReactElement, useLayoutEffect, useRef, useState } from 'react';
import createBrowserHistory, { BrowserHistory } from './history';
import { Router } from './Router';

interface BrowserRouterProps {
  basename?: string;
  children: ReactElement;
  window?: Window;
}

export default function BrowserRouter(props: BrowserRouterProps) {

  const historyRef = useRef<BrowserHistory>(null!)

  if (!historyRef.current) {
    historyRef.current = createBrowserHistory()
  }

  const history = historyRef.current

  const [locationState, setLocationState] = useState(history.location)
  const [action, setAction] = useState(history.action)

  useLayoutEffect(() => {
    history.listen(({ location, action }) => {
      setLocationState(location)
      setAction(action)
    })
  }, [history])

  return <Router
    history={{
      ...history,
      action,
    }}
    location={locationState}
  >
    {props.children}
  </Router>
}

