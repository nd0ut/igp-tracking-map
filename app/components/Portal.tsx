import ReactDOM from "react-dom";

export function Portal({
  node,
  children,
}: {
  node?: Element | null;
  children: React.ReactNode;
}) {
  if (!node) {
    return null;
  }
  return ReactDOM.createPortal(children, node);
}
