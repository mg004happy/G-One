/**
 * Form validation helper patterns.
 * Used with React Hook Form's `register` rules.
 */

export const emailRules = {
  required: 'Email is required',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Please enter a valid email address',
  },
};

export const passwordRules = {
  required: 'Password is required',
  minLength: {
    value: 6,
    message: 'Password must be at least 6 characters',
  },
};

export const fullNameRules = {
  required: 'Full name is required',
  minLength: {
    value: 2,
    message: 'Name must be at least 2 characters',
  },
};

export const phoneRules = {
  required: 'Phone number is required',
  pattern: {
    value: /^\+?[0-9]{7,15}$/,
    message: 'Please enter a valid phone number',
  },
};

export const pincodeRules = {
  required: 'Pincode is required',
  pattern: {
    value: /^[0-9]{4,10}$/,
    message: 'Please enter a valid pincode',
  },
};

export const requiredRule = (fieldName) => ({
  required: `${fieldName} is required`,
});

export const priceRules = {
  required: 'Price is required',
  min: {
    value: 0.01,
    message: 'Price must be greater than 0',
  },
};
