/**
 * Processes Arabic text and applies Tajweed rules using color coding
 * @param {string} text - Arabic text to process
 * @returns {Array} - Array of text segments with colors and formatting
 */
export const processTajweedText = (text) => {
  if (!text) return [{ text: '', color: '#000000' }];

  // Tajweed rules with regular expressions and colors
  const tajweedRules = [
    // Ghunnah - Nasalization
    { regex: /ن|م(?=[ّْ])/g, color: '#559500', rule: 'ghunnah' },
    
    // Idgham - Merging with Ghunnah
    { regex: /ن(?=[ينمو])/g, color: '#FF00FF', rule: 'idgham_with_ghunnah' },
    
    // Idgham - Merging without Ghunnah
    { regex: /ن(?=[رل])/g, color: '#FF7E1E', rule: 'idgham_without_ghunnah' },
    
    // Iqlab - Conversion
    { regex: /ن(?=ب)/g, color: '#26BFFC', rule: 'iqlab' },
    
    // Ikhfa - Concealment
    { regex: /ن(?=[تثجدذزسشصضطظفقكک])/g, color: '#9400A8', rule: 'ikhfa' },
    
    // Qalqalah - Echo/Bouncing sound
    { regex: /[قطبجد](?=[ْ])/g, color: '#DD0008', rule: 'qalqalah' },
    
    // Mad - Prolongation
    { regex: /[َُِ]?[اوي](?=[ء])|[َُِ][اوي]/g, color: '#DD8C00', rule: 'madd' },
  ];

  // Start with the whole text as one segment
  let segments = [{ text, color: '#000000', rule: null }];

  // Apply each tajweed rule
  tajweedRules.forEach(({ regex, color, rule }) => {
    const newSegments = [];
    
    segments.forEach(segment => {
      if (segment.rule) {
        // Already processed segment, keep as is
        newSegments.push(segment);
        return;
      }
      
      // Find matches in this segment
      const parts = segment.text.split(regex);
      const matches = segment.text.match(regex) || [];
      
      let i = 0;
      parts.forEach((part, index) => {
        // Add the regular part
        if (part) {
          newSegments.push({ text: part, color: '#000000', rule: null });
        }
        
        // Add the match with tajweed color
        if (index < matches.length) {
          newSegments.push({ text: matches[index], color, rule, isBold: true });
        }
      });
    });
    
    segments = newSegments;
  });

  return segments;
};

/**
 * Check if the device supports tajweed rendering
 * Some older devices might have issues with complex text rendering
 */
export const checkTajweedSupport = () => {
  // In a real app, you would do more sophisticated detection
  // This is a placeholder implementation
  return true;
};