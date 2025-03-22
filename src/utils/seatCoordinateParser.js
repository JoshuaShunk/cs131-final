/**
 * Utility functions for parsing and handling seat coordinates
 */

/**
 * Parse a string of Vector coordinates in the format <Vector (x, y, z)>
 * @param {string} text - Text containing Vector coordinates, one per line
 * @returns {Array} Array of parsed coordinates objects with x, y, z properties
 */
export const parseVectorCoordinates = (text) => {
  if (!text) return [];
  
  const coordinates = [];
  
  // Split the text by lines and process each line
  const lines = text.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (!line || !line.includes('<Vector')) return;
    
    // Extract the coordinates part from the format <Vector (x, y, z)>
    const match = line.match(/<Vector\s*\(([-\d\.\s,]+)\)>/);
    if (!match || !match[1]) return;
    
    // Split the coordinates and convert to numbers
    const parts = match[1].split(',').map(part => parseFloat(part.trim()));
    if (parts.length !== 3) return;
    
    coordinates.push({
      x: parts[0],
      y: parts[1],
      z: parts[2]
    });
  });
  
  return coordinates;
};

/**
 * Convert the parsed vector coordinates to Three.js coordinates
 * @param {Array} coordinates - Array of coordinate objects with x, y, z properties
 * @returns {Array} Array of coordinate objects converted to Three.js coordinate system
 */
export const convertToThreeCoordinates = (coordinates) => {
  return coordinates.map(coord => ({
    x: coord.x,
    y: coord.z, // Vector Y becomes Three.js Z for top-down view
    z: coord.y  // Vector Z becomes Three.js Y for height
  }));
};

/**
 * Generate seat data from parsed coordinates
 * @param {Array} coordinates - Array of coordinate objects
 * @returns {Array} Array of seat objects with id, section, row, price, and coordinates
 */
export const generateSeatsFromCoordinates = (coordinates) => {
  return coordinates.map((coord, index) => {
    // Determine section based on X coordinate
    let section = 'A';
    if (coord.x > 0) {
      section = 'B';
    }
    
    // Simple algorithm to determine row and number based on position
    const row = Math.floor(Math.abs(coord.y) * 10) % 10 + 1;
    const number = Math.floor(Math.abs(coord.x) * 10) % 10 + 1;
    
    // Generate a price based on height (better seats are higher)
    const height = Math.abs(coord.z);
    const price = Math.floor(100 + height * 50);
    
    return {
      id: `${section}${row}${number}`,
      section,
      row,
      number,
      price,
      coordinates: coord
    };
  });
};

/**
 * Parse a string of coordinates and generate seat data
 * @param {string} text - Text containing Vector coordinates, one per line
 * @returns {Array} Array of seat objects with id, section, row, price, and coordinates
 */
export const parseAndGenerateSeats = (text) => {
  const parsedCoordinates = parseVectorCoordinates(text);
  const threeCoordinates = convertToThreeCoordinates(parsedCoordinates);
  return generateSeatsFromCoordinates(threeCoordinates);
};

export default {
  parseVectorCoordinates,
  convertToThreeCoordinates,
  generateSeatsFromCoordinates,
  parseAndGenerateSeats
}; 