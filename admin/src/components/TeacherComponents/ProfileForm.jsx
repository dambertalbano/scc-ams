import React from 'react';

const ReadOnlyEmailField = ({ formData }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        type="email"
        name="email"
        id="email"
        value={formData.email}
        readOnly
        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
      />
    </div>
  );
};

export default ReadOnlyEmailField;