import alaArcha from "@/assets/tour-ala-archa.jpg";
import songKul from "@/assets/tour-song-kul.jpg";
import kelSuu from "@/assets/tour-kel-suu.jpg";
import altynArashan from "@/assets/tour-altyn-arashan.jpg";
import jyrgalan from "@/assets/tour-jyrgalan.jpg";
import issykKul from "@/assets/tour-issyk-kul.jpg";
import gAlaArcha from "@/assets/gallery-ala-archa.jpg";
import gSongKul from "@/assets/gallery-song-kul.jpg";
import gKelSuu from "@/assets/gallery-kel-suu.jpg";
import gAltynArashan from "@/assets/gallery-altyn-arashan.jpg";
import gJyrgalan from "@/assets/gallery-jyrgalan.jpg";
import gIssykKul from "@/assets/gallery-issyk-kul.jpg";
import heroMountains from "@/assets/hero-mountains.jpg";

const images: Record<string, string> = {
  "ala-archa": alaArcha,
  "song-kul": songKul,
  "kel-suu": kelSuu,
  "altyn-arashan": altynArashan,
  jyrgalan,
  "issyk-kul": issykKul,
};

const gallery: Record<string, string> = {
  "ala-archa": gAlaArcha,
  "song-kul": gSongKul,
  "kel-suu": gKelSuu,
  "altyn-arashan": gAltynArashan,
  jyrgalan: gJyrgalan,
  "issyk-kul": gIssykKul,
};

export function tourImage(key: string): string {
  return images[key] ?? alaArcha;
}

/** Photos for the tour gallery: main photo, a second trip photo, and a Tian Shan landscape. */
export function tourGallery(key: string): string[] {
  return [tourImage(key), gallery[key] ?? gAlaArcha, heroMountains];
}
