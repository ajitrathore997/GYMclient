import React, { useState, useEffect } from 'react';

const Modal = () => {
  const [isModalOpen, setIsModalOpen] = useState(true); 

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
  }, []);

  return (
    <div className="App">
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Welcome to SR Fitness
            </h2>
            <p className="text-gray-600 mb-6">
  If you would like a similar application built for you, feel free to contact me at{" "}
  <span className="font-medium text-gray-800">80885144483</span>.{" "}
  You can also check out my{" "}
  <a
    href="https://github.com/ajitrathore997"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 underline"
  >
    GitHub
  </a>
  .
</p>

            <button
              onClick={closeModal}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Modal;
