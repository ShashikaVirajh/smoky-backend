export const lowerCase = (str: string): string => str.toLowerCase();

export const upperCase = (str: string): string => str.toUpperCase();

export const capitalizeFirstLetter = (text: string): string => {
  const lowercaseArr = lowerCase(text).split(' ');
  return lowercaseArr.map((word: string) => lowerCase(word.charAt(0)) + word.slice(1)).join(' ');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJson = (prop: string): any => {
  try {
    JSON.parse(prop);
  } catch (error) {
    return prop;
  }
  return JSON.parse(prop);
};

export const shuffle = (list: string[]): string[] => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
};
