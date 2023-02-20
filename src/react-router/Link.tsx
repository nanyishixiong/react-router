import React from "react"
import { useContext } from "react"
import { RouterContext } from "./RouterContext"


interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string
}


export default function Link({ to, children }: LinkProps) {

  const { history } = useContext(RouterContext)

  const onClick = () => {
    history.push(to, { name: 'Nanyi' })
  }

  return <button
    type="button"
    style={{
      backgroundColor: "transparent",
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
      display: 'inline',
      margin: 0,
      padding: 0,
    }}
    onClick={onClick}
  >
    {children}
  </button >
}