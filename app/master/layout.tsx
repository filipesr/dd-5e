import { PinGuard } from "@/components/master/PinGuard";

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return <PinGuard>{children}</PinGuard>;
}
