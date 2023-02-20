import { useContext, useEffect } from "react";
import { RouterContext } from "./RouterContext";

interface NavigateProps {
  to: string;
  replace?: boolean;
}

export default function Navigate({ to = "", replace = false }: NavigateProps) {

  const { history } = useContext(RouterContext)

  useEffect(() => {
    if (replace) {
      history.replace(to)
    } else {
      history.push(to)
    }
  })

  return null
}
