export const numberRegex = /[0-9]/;
export const upperCaseRegex = /[A-Z]/;
export const lowerCaseRegex = /[a-z]/;
export const specialChars = `!#$%&'()*+,-./:;<=>?@[\]^_{|}~`;
export const specialCharRegex = /[!#$%&'()*+,-./:;<=>?@[\]^_{|}~]/;

export const rules = [
  {
    name: 'Minimum of 8 characters',
    isValid: (password: string) => password.length >= 8,
  },
  {
    name: 'At least one UPPERCASE LETTER',
    isValid: (password: string) => upperCaseRegex.test(password),
  },
  {
    name: 'At least one lowercase letter',
    isValid: (password: string) => lowerCaseRegex.test(password),
  },
  {
    name: 'At least one digit (0-9)',
    isValid: (password: string) => numberRegex.test(password),
  },
  {
    name: `One special character (e.g. ${specialChars})`,
    isValid: (password: string) => specialCharRegex.test(password),
  },
];

function score(pass) {
  let score = 0;
  if (!pass) return score;

  const letters = new Object();
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
    score += 5.0 / letters[pass[i]];
  }

  score = score > 50 ? 50 : score;

  let variationCount = 0;
  for (let i = 0; i < rules.length; i++) {
    variationCount += rules[i].isValid(pass) ? 1 : 0;
  }

  score += (variationCount - 1) * 10;

  return score;
}

export function getStrength(password) {
  const passwordScore = score(password);
  if (passwordScore > 80) {
    return {
      name: 'Strong',
      level: 4,
    };
  }

  if (passwordScore > 60) {
    return {
      name: 'Good',
      level: 3,
    };
  }

  if (passwordScore > 30) {
    return {
      name: 'Weak',
      level: 2,
    };
  }

  if (passwordScore > 0) {
    return {
      name: 'Very weak',
      level: 1,
    };
  }

  return {
    name: 'None',
    level: 0,
  };
}
