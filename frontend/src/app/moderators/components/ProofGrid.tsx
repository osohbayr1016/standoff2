"use client";

interface ProofGridProps {
  screenshots: string[];
  onViewImage: (url: string) => void;
}

export default function ProofGrid({ screenshots, onViewImage }: ProofGridProps) {
  return (
    <div>
      <label className="text-gray-400 text-sm flex items-center gap-2">
        <span>Submitted Proof</span>
      </label>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {screenshots.map((url: string, index: number) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => onViewImage(url)}
          >
            <img
              src={url}
              alt={`Proof ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-600 hover:border-orange-500 transition-colors"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm">View</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

