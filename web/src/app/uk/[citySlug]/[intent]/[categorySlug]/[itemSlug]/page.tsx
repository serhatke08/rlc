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
  return generateListingSeoMetadata({ params: props.params, market: "uk" });
}

export default async function UkListingSeoPage(props: Props) {
  return ListingSeoRoutePage({ params: props.params, market: "uk" });
}
