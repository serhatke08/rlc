import type { Metadata } from "next";

import {
  ListingSeoRoutePage,
  generateListingSeoMetadata,
} from "@/components/listing-seo-route-page";

type Props = {
  params: Promise<{
    citySlug: string;
    intent: string;
    categorySlug: string;
    itemSlug: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateListingSeoMetadata({ params: props.params, market: "us" });
}

export default async function UsListingSeoPage(props: Props) {
  return ListingSeoRoutePage({ params: props.params, market: "us" });
}
