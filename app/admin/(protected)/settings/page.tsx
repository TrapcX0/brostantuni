import { SettingsManager } from "@/components/settings-manager";
import { menuRepository } from "@/lib/data/repositories";

export default async function SettingsPage() {
  const settings = await menuRepository.getForAdmin();
  return (
    <SettingsManager
      settings={
        settings ?? {
          restaurantName: "",
          description: "",
          logoUrl: null,
          instagramUrl: null,
          whatsappNumber: null,
          whatsappMessage: null,
          seoTitle: null,
          seoDescription: null
        }
      }
    />
  );
}
