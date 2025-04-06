import { useState, useMemo, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import axios from 'axios';

import withTransition from '../components/withTransition';
import { NFTContext } from '../context/NFTContext';
import { Button, Input, Loader } from '../components';
import images from '../assets';

const CreateNFT = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '', aiPrompt: '' });
  const [activeSection, setActiveSection] = useState('upload'); // 'upload' or 'ai'
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme } = useTheme();
  const { isLoadingNFT, uploadToIPFS, createNFT } = useContext(NFTContext);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);
    setFileUrl(url);
  }, [uploadToIPFS]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize: 5000000,
    disabled: activeSection !== 'upload',
  });

  const generateAIImage = async () => {
    if (!formInput.aiPrompt) {
      alert('Please enter a prompt to generate an image.');
      return;
    }
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('prompt', formInput.aiPrompt);
      formData.append('output_format', 'webp');

      const response = await axios.post(
        'https://api.stability.ai/v2beta/stable-image/generate/core',
        formData,
        {
          headers: {
            Authorization: 'Bearer sk-MYAPIKEY', // Replace with your actual API key
            Accept: 'image/*',
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        }
      );

      const file = new File([response.data], 'generated-image.webp', { type: 'image/webp' });
      const url = await uploadToIPFS(file);
      setFileUrl(url);
    } catch (error) {
      console.error('Error generating image:', error.response ? error.response.data : error.message);
      alert('Failed to generate image. Check console for details.');
    }
    setIsGenerating(false);
  };

  const fileStyle = useMemo(
    () => `
      dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-lg border-dashed
      ${isDragActive && ' border-blue-500'}
      ${isDragAccept && ' border-green-500'}
      ${isDragReject && ' border-red-500'}
    `,
    [isDragActive, isDragAccept, isDragReject]
  );

  // Full-screen loading overlay
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse rounded-full"></div>
        <p className="mt-4 text-white text-lg font-semibold">
          {isGenerating ? 'Generating Image...' : 'Creating NFT...'}
        </p>
      </div>
    </div>
  );

  if (isLoadingNFT || isGenerating) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex justify-center sm:px-4 p-12 relative min-h-screen">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-3xl font-bold mb-8 text-center">
          Create a New NFT
        </h1>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-12">
          <div className="relative inline-flex items-center bg-gray-200 dark:bg-nft-black-1 rounded-full p-1 w-64">
            <button
              onClick={() => setActiveSection('upload')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeSection === 'upload'
                  ? ' text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => setActiveSection('ai')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeSection === 'ai'
                  ? ' text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Generate AI Image
            </button>
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-blue-500/25 rounded-full transition-transform duration-300 ${
                activeSection === 'upload' ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
          </div>
        </div>

        {/* Upload Section */}
        {activeSection === 'upload' && (
          <div className="mt-8 bg-white dark:bg-nft-black-1 p-6 rounded-lg shadow-md">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl mb-4">
              Upload Your Image
            </p>
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-lg">
                  JPG, PNG, GIF, SVG, WEBM (Max 100mb)
                </p>
                <div className="my-8 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    width={80}
                    height={80}
                    objectFit="contain"
                    alt="file upload"
                    className={theme === 'light' ? 'filter invert' : ''}
                  />
                </div>
                <p className="font-poppins dark:text-white text-nft-black-1 text-sm">
                  Drag and drop or click to browse
                </p>
              </div>
            </div>
            {fileUrl && (
              <div className="mt-4">
                <img src={fileUrl} alt="uploaded_image" className="rounded-lg max-w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {/* AI Generation Section */}
        {activeSection === 'ai' && (
          <div className="mt-8 bg-white dark:bg-nft-black-1 p-6 rounded-lg shadow-md">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl mb-4">
              Generate AI Image
            </p>
            <Input
              inputType="textarea"
              title="AI Prompt"
              placeholder="e.g., 'A futuristic city at night'"
              handleClick={(e) => setFormInput({ ...formInput, aiPrompt: e.target.value })}
            />
            <Button
              btnName={isGenerating ? 'Generating...' : 'Generate Image'}
              classStyles="rounded-xl mt-4 bg-blue-600 hover:bg-blue-700"
              handleClick={generateAIImage}
              disabled={isGenerating}
            />
            {fileUrl && (
              <div className="mt-4">
                <img src={fileUrl} alt="generated_image" className="rounded-lg max-w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="mt-12 space-y-6">
          <Input
            inputType="input"
            title="Name"
            placeholder="NFT name"
            handleClick={(e) => setFormInput({ ...formInput, name: e.target.value })}
          />
          <Input
            inputType="textarea"
            title="Description"
            placeholder="NFT Description"
            handleClick={(e) => setFormInput({ ...formInput, description: e.target.value })}
          />
          <Input
            inputType="number"
            title="Price"
            placeholder="NFT Price (ETH)"
            handleClick={(e) => setFormInput({ ...formInput, price: e.target.value })}
          />
        </div>

        {/* Create Button */}
        <div className="mt-8 flex justify-end">
          <Button
            btnName="Create NFT"
            classStyles="rounded-xl bg-green-600 hover:bg-green-700 px-6 py-3"
            handleClick={() => createNFT(formInput, fileUrl, router)}
            disabled={!fileUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default withTransition(CreateNFT);