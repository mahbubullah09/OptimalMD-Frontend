import "../admin.css";

/** Login sits outside the portal chrome but still needs the admin styles. */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="adminRoot">{children}</div>;
}
