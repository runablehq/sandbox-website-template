import { AutumnProvider } from "autumn-js/react";
import { Metadata } from "./metadata";

interface ProviderProps {
  children: React.ReactNode;

}
export function Provider({ children }: ProviderProps) {
  return <AutumnProvider betterAuthUrl={import.meta.env.VITE_BASE_URL}>
    <Metadata />
    {children}
  </AutumnProvider>
}