import alaArcha from "@/assets/tour-ala-archa.jpg";
import songKul from "@/assets/tour-song-kul.jpg";
import kelSuu from "@/assets/tour-kel-suu.jpg";
import altynArashan from "@/assets/tour-altyn-arashan.jpg";
import jyrgalan from "@/assets/tour-jyrgalan.jpg";
import issykKul from "@/assets/tour-issyk-kul.jpg";

const images: Record<string, string> = {
  "ala-archa": alaArcha,
  "song-kul": songKul,
  "kel-suu": kelSuu,
  "altyn-arashan": altynArashan,
  jyrgalan,
  "issyk-kul": issykKul,
};

export function tourImage(key: string): string {
  return images[key] ?? alaArcha;
}
