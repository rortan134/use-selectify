import { redirect } from "next/navigation";

import { Container } from "../components/Container";
import { Button } from "../components/Button";

import { ExternalLink, Github, Menu, Copy } from "lucide-react";

export default function Page() {
  return redirect("/docs/examples");
}
