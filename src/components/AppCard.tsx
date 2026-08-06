import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { SolidApp } from '@/lib/rdfUtils';
import { generateAppColor, generateInitials, isValidImageUrl } from '@/lib/imageUtils';

interface AppCardProps {
  app: SolidApp;
  index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const hasValidImage = isValidImageUrl(app.image) && !imageError;
  const appColor = generateAppColor(app.name);
  const initials = generateInitials(app.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
        {hasValidImage ? (
          <>
            {imageLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center text-white font-bold text-4xl"
                style={{ backgroundColor: appColor }}
              >
                {initials}
              </div>
            )}
            {app.image?.endsWith('.svg') ? (
              <img
                src={app.image}
                alt={app.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoading(false)}
              />
            ) : (
              <Image
                src={app.image!}
                alt={app.name}
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onLoad={() => setImageLoading(false)}
                unoptimized
                crossOrigin="anonymous"
              />
            )}
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold text-4xl"
            style={{ backgroundColor: appColor }}
          >
            {initials}
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          {app.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {app.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {app.description}
        </p>

        <div className="flex items-center justify-between">
          <a
            href={app.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C4DFF] text-white rounded-lg hover:bg-[#6A3FE5] transition-colors duration-200 font-medium text-sm"
          >
            Open
            <ExternalLink className="w-4 h-4" />
          </a>

          {app.source && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Info className="w-3 h-3" />
              <span>{app.source}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}