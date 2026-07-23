export const validatePhone = (number) => {
  const regex = /^\d{10}$/;
  if (!regex.test(number)) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }
  return { valid: true, error: null };
};

export const validateName = (name) => {
  const regex = /^[A-Za-z\s]{2,}$/;
  if (!regex.test(name)) {
    return { valid: false, error: 'Name must contain at least 2 alphabetic characters' };
  }
  return { valid: true, error: null };
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true, error: null };
};

export const validateSkillScore = (score) => {
  const num = Number(score);
  if (isNaN(num) || num < 0 || num > 100) {
    return { valid: false, error: 'Score must be a number between 0 and 100' };
  }
  return { valid: true, error: null };
};
