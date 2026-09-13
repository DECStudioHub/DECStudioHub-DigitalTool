import React from 'react';
import { Star } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

interface FavoriteButtonProps {
  toolId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  toolId,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(toolId);

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonPaddings = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'px-2.5 py-1.5',
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(toolId);
      }}
      aria-label={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
      title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
      className={`inline-flex items-center gap-1.5 rounded-lg transition group ${buttonPaddings[size]} ${
        favorited
          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20'
          : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/80 border border-transparent'
      } ${className}`}
    >
      <Star
        className={`${iconSizes[size]} transition transform group-hover:scale-110 ${
          favorited ? 'fill-amber-400 text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
        }`}
      />
      {showLabel && (
        <span className="text-xs font-medium whitespace-nowrap">
          {favorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
};
