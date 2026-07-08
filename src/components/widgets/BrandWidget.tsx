interface BrandWidgetProps {
  brandName: string;
  slogan: string;
  logoUrl?: string;
}

export default function BrandWidget({ brandName, slogan, logoUrl }: BrandWidgetProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <img src="https://i.imgur.com/ySks3l5.jpeg" alt="Logo" className="w-[80%] max-w-[800px] h-auto" />
    </div>
  );
}
