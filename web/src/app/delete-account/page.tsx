import type { Metadata } from "next";

import { DeleteAccountForm } from "./delete-account-form";

export const metadata: Metadata = {
  title: "Delete ReloopCycle Account",
  description:
    "Permanently delete a ReloopCycle app and website account. Enter the username and password for that account to confirm, then delete.",
  robots: {
    index: true,
    follow: false,
  },
};

export default function DeleteAccountPage() {
  return <DeleteAccountForm />;
}
