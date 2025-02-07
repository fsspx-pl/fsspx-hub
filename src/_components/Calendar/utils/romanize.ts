interface RomanNumeral {
    [key: string]: number;
  }
  
  export function romanize(num: number): string {
    if (num <= 0 || num >= 4000) {
      throw new Error('Number must be between 1 and 3999');
    }
  
    const romanNumerals: RomanNumeral = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    };
  
    let result = '';
    
    for (const [symbol, value] of Object.entries(romanNumerals)) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
  
    return result;
  }