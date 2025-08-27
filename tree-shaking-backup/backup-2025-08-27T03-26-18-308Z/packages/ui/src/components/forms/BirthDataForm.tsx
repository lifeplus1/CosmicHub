import React from 'react';
export interface BirthDataFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}
export const BirthDataForm: React.FC<BirthDataFormProps> = () => (
  <div className='p-4'>
    <h3 className='text-lg font-semibold mb-4'>Birth Data Form</h3>
    <div className='text-center py-8 text-gray-500'>
      Birth data form placeholder
    </div>
  </div>
);
export default BirthDataForm;
