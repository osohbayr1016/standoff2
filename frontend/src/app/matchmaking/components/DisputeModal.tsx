import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../contexts/AuthContext";

interface DisputeModalProps {
  matchId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisputeModal({
  matchId,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const { getToken } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 2) {
      setError("Дээд тал нь 2 зураг");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${API_ENDPOINTS.UPLOAD}/image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          uploadedUrls.push(data.data.url);
        }
      }

      setImages([...images, ...uploadedUrls].slice(0, 2));
    } catch (error) {
      setError("Зураг upload хийхэд алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (images.length === 0 && !description.trim()) {
      setError("Хамгийн багадаа зураг эсвэл тайлбар оруулна уу");
      return;
    }

    if (
      !window.confirm("Dispute үүсгэх үү? Admin шийдвэрлэх хүртэл хүлээнэ.")
    ) {
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/api/matches/${matchId}/dispute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
          body: JSON.stringify({
            images,
            description: description.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || "Алдаа гарлаа");
      }
    } catch (error) {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Dispute үүсгэх
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-orange-900 bg-opacity-30 border border-orange-500 rounded-lg p-3 mb-4">
          <p className="text-orange-300 text-sm">
            ⚠️ Ялалтын дэлгэцийн зургаа хамт тайлбараа бичээд явуулна уу
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-white mb-2">
              <ImageIcon className="w-5 h-5" />
              Зураг (дээд тал нь 2)
            </label>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {images.length < 2 && (
              <label className="block w-full bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg text-center cursor-pointer">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                {uploading ? "Upload хийж байна..." : "Зураг upload"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || images.length >= 2}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-white mb-2">
              Тайлбар (сонголттой)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Нэмэлт мэдээлэл, гомдол..."
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              maxLength={500}
            />
            <p className="text-gray-400 text-xs mt-1">
              {description.length}/500
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold"
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Илгээж байна..." : "Илгээх"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
