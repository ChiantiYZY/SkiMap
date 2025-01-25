import Image from 'next/image';

interface ImagePreviewProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImagePreview({ imageUrl, onClose }: ImagePreviewProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          Close
        </button>
        <Image
          src={imageUrl}
          alt="Full size preview"
          width={1200}
          height={800}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
          unoptimized
        />
      </div>
    </div>
  );
} 