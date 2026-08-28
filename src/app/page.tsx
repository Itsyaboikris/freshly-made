import {
  HomeAboutSection,
  HomeFeaturesSection,
  HomeMenuTeaser,
  HomeOrderCallout,
} from "@/components/HomeSections";
import { HomeHero } from "@/components/HomeHero";

export default function Home() {
  return (
    <div className="relative flex-1">
      <HomeHero />
      <HomeOrderCallout />
      <HomeMenuTeaser />
      <HomeFeaturesSection />
      <HomeAboutSection />
    </div>
  );
}
