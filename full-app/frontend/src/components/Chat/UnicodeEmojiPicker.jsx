// components/Chat/UnicodeEmojiPicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Smile, Search, X } from 'lucide-react';

const UnicodeEmojiPicker = ({ onEmojiSelect, buttonClassName = "" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [filteredEmojis, setFilteredEmojis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef(null);

  // Catégories d'émojis avec leurs plages Unicode
  const emojiCategories = [
    { name: 'all', label: 'Tous', ranges: [] },
    { name: 'smileys', label: 'Smileys', ranges: [{ start: 0x1F600, end: 0x1F64F }] },
    { name: 'animals', label: 'Animaux', ranges: [{ start: 0x1F400, end: 0x1F43F }] },
    { name: 'food', label: 'Nourriture', ranges: [{ start: 0x1F345, end: 0x1F37F }] },
    { name: 'activities', label: 'Activités', ranges: [{ start: 0x1F380, end: 0x1F3CF }] },
    { name: 'travel', label: 'Voyage', ranges: [{ start: 0x1F300, end: 0x1F32F }] },
    { name: 'objects', label: 'Objets', ranges: [{ start: 0x1F330, end: 0x1F37F }] },
    { name: 'symbols', label: 'Symboles', ranges: [{ start: 0x1F300, end: 0x1F5FF }] },
    { name: 'flags', label: 'Drapeaux', ranges: [{ start: 0x1F1E6, end: 0x1F1FF }] },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showPicker && emojis.length === 0) {
      generateEmojis();
    }
  }, [showPicker]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmojis(emojis);
    } else {
      const filtered = emojis.filter(emoji => 
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmojis(filtered);
    }
  }, [searchTerm, emojis]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredEmojis(emojis);
    } else {
      const filtered = emojis.filter(emoji => emoji.category === activeCategory);
      setFilteredEmojis(filtered);
    }
  }, [activeCategory, emojis]);

  const generateEmojis = () => {
    setLoading(true);
    
    try {
      const generatedEmojis = [];
      
      // Émojis fréquemment utilisés (ajoutés manuellement)
      const frequentEmojis = [
        { char: '😀', name: 'grinning face', category: 'smileys' },
        { char: '😂', name: 'face with tears of joy', category: 'smileys' },
        { char: '❤️', name: 'red heart', category: 'symbols' },
        { char: '👍', name: 'thumbs up', category: 'symbols' },
        { char: '😊', name: 'smiling face with smiling eyes', category: 'smileys' },
        { char: '🎉', name: 'party popper', category: 'activities' },
        { char: '🔥', name: 'fire', category: 'symbols' },
        { char: '😍', name: 'smiling face with heart-eyes', category: 'smileys' },
        { char: '🤔', name: 'thinking face', category: 'smileys' },
        { char: '👏', name: 'clapping hands', category: 'symbols' },
      ];
      
      // Ajouter les émojis fréquents
      generatedEmojis.push(...frequentEmojis);
      
      // Générer des émojis à partir des plages Unicode
      const emojiRanges = [
        { start: 0x1F600, end: 0x1F64F, category: 'smileys' }, // Émotions
        { start: 0x1F300, end: 0x1F32F, category: 'travel' },   // Transport et symboles
        { start: 0x1F330, end: 0x1F37F, category: 'food' },     // Nourriture
        { start: 0x1F380, end: 0x1F3CF, category: 'activities' }, // Activités
        { start: 0x1F400, end: 0x1F43F, category: 'animals' },   // Animaux
        { start: 0x1F440, end: 0x1F4FF, category: 'objects' },   // Objets
        { start: 0x1F600, end: 0x1F64F, category: 'smileys' },   // Émotions
        { start: 0x2600, end: 0x26FF, category: 'symbols' },    // Symboles divers
        { start: 0x2700, end: 0x27BF, category: 'symbols' },    // Symboles dingbat
        { start: 0x1F900, end: 0x1F9FF, category: 'symbols' },   // Symboles supplémentaires
        { start: 0x1F680, end: 0x1F6FF, category: 'travel' },   // Transport et symboles
      ];

      emojiRanges.forEach(range => {
        for (let code = range.start; code <= range.end; code++) {
          try {
            const emoji = String.fromCodePoint(code);
            
            // Vérifier si l'émoji est affichable (pas un caractère de contrôle)
            if (/\p{Emoji}/u.test(emoji) && !/\p{Number}/u.test(emoji)) {
              // Ajouter uniquement si ce n'est pas un doublon
              if (!generatedEmojis.some(e => e.char === emoji)) {
                generatedEmojis.push({
                  char: emoji,
                  name: `unicode-${code.toString(16)}`,
                  category: range.category
                });
              }
            }
          } catch (e) {
            // Ignorer les codes invalides
          }
        }
      });

      setEmojis(generatedEmojis.slice(0, 200)); // Limiter à 200 émojis pour la performance
    } catch (error) {
      console.error('Erreur lors de la génération des émojis:', error);
    } finally {
      setLoading(false);
    }
  };

  const onEmojiClick = (emoji) => {
    onEmojiSelect(emoji.char);
    setShowPicker(false);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${buttonClassName}`}
        title="Ajouter un émoji"
      >
        <Smile className="h-5 w-5 text-gray-500" />
      </button>
      
      {showPicker && (
        <div className="absolute bottom-12 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-80">
          {/* En-tête avec recherche et fermeture */}
          <div className="flex items-center justify-between mb-3">
            <div className="relative flex-1 mr-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un émoji..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          
          {/* Catégories */}
          <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-200">
            {emojiCategories.map(category => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeCategory === category.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Grille d'émojis */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onEmojiClick(emoji)}
                    className="text-xl p-1 hover:bg-gray-100 rounded transition-colors"
                    title={emoji.name}
                  >
                    {emoji.char}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500 text-sm">
                {searchTerm ? 'Aucun émoji trouvé' : 'Aucun émoji disponible'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnicodeEmojiPicker;