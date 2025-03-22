import { parseAndGenerateSeats } from './seatCoordinateParser';

/**
 * Loads seat coordinates from the coordinates.txt file and generates seat objects
 * @returns {Promise<Array>} Promise that resolves to an array of seat objects
 */
export const loadSeatsFromFile = async () => {
  try {
    // Fetch the coordinates.txt file
    const response = await fetch('/coordinates.txt');
    if (!response.ok) {
      throw new Error(`Failed to load coordinates.txt: ${response.status} ${response.statusText}`);
    }
    
    // Get the text content
    const text = await response.text();
    console.log('Loaded coordinates file with length:', text.length);
    
    // Parse the coordinates and generate seats
    const seats = parseAndGenerateSeats(text);
    console.log(`Generated ${seats.length} seats from coordinates`);
    
    // Add more detailed seat info for better user experience
    const enhancedSeats = enhanceSeats(seats);
    
    return enhancedSeats;
  } catch (error) {
    console.error('Error loading seats from file:', error);
    return []; // Return empty array on error
  }
};

/**
 * Enhances basic seat data with more details like section names, meaningful IDs, etc.
 * @param {Array} basicSeats - Basic seat objects from the coordinate parser
 * @returns {Array} Enhanced seat objects with more detailed information
 */
const enhanceSeats = (basicSeats) => {
  // Map of sections by quadrant
  const sectionMap = {
    'topLeft': ['A', 'B', 'C'],
    'topRight': ['D', 'E', 'F'],
    'bottomLeft': ['G', 'H', 'J'],
    'bottomRight': ['K', 'L', 'M']
  };
  
  // Price tiers based on distance from center (higher = better view)
  const priceTiers = [
    { maxDistance: 0.2, price: 250 },
    { maxDistance: 0.4, price: 200 },
    { maxDistance: 0.6, price: 150 },
    { maxDistance: 0.8, price: 120 },
    { maxDistance: Infinity, price: 100 }
  ];
  
  return basicSeats.map((seat, index) => {
    // Determine quadrant based on x and y coordinates
    const quadrant = seat.coordinates.x < 0 
      ? (seat.coordinates.y < 0 ? 'bottomLeft' : 'topLeft')
      : (seat.coordinates.y < 0 ? 'bottomRight' : 'topRight');
    
    // Calculate distance from center (0,0) for price determination
    const distance = Math.sqrt(
      Math.pow(seat.coordinates.x, 2) + 
      Math.pow(seat.coordinates.y, 2)
    );
    
    // Determine price based on distance
    const priceTier = priceTiers.find(tier => distance <= tier.maxDistance);
    const price = priceTier ? priceTier.price : 100;
    
    // Determine section, row, and seat number more meaningfully
    const sectionList = sectionMap[quadrant];
    const sectionIndex = Math.min(
      Math.floor(distance * sectionList.length), 
      sectionList.length - 1
    );
    const section = sectionList[sectionIndex];
    
    // Row increases as y moves away from 0 (either positive or negative)
    const row = Math.floor(Math.abs(seat.coordinates.y) * 10) + 1;
    
    // Seat number increases as x moves away from 0 (either positive or negative)
    const number = Math.floor(Math.abs(seat.coordinates.x) * 10) + 1;
    
    // Create a more meaningful ID
    const id = `${section}${row}-${number}`;
    
    return {
      id,
      section,
      row,
      number,
      price,
      coordinates: seat.coordinates,
      // Store original index for reference
      originalIndex: index
    };
  });
};

export default {
  loadSeatsFromFile
}; 