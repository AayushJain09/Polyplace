import React, { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const nftCurrency = 'ETH';
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const checkIfWalletIsConnect = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) setCurrentAccount(accounts[0]);
    else console.log('No accounts found');
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask.');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios({
        method: 'POST',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          pinata_api_key: `319da2febea3e7121f08`,
          pinata_secret_api_key: `a8cc352946905a8a9eb5e64bdfed7d46fcd14fd334db248699f2a0e0aad3e0ca`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      return fileUrl;
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  };

  const createNFT = async (formInput, fileUrl, router, assetType = 'image') => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    // Metadata with assetType differentiation
    const data = JSON.stringify({
      name,
      description,
      ...(assetType === 'image' ? { image: fileUrl } : { animation_url: fileUrl }), // Use animation_url for audio
      assetType, // Add assetType to metadata
    });

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data: data,
        headers: {
          pinata_api_key: `319da2febea3e7121f08`,
          pinata_secret_api_key: `a8cc352946905a8a9eb5e64bdfed7d46fcd14fd334db248699f2a0e0aad3e0ca`,
          'Content-Type': 'application/json',
        },
      });
      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      await createSale(url, price);
      router.push('/');
    } catch (error) {
      console.log('Error creating NFT: ', error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, { value: listingPrice.toString() })
      : await contract.resellToken(id, price, { value: listingPrice.toString() });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);
    const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/63D8xMT7bh0uQybtkfOzlEHWQ39vB2Wz');
    const contract = fetchContract(provider);
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        try {
          const { data: metadata } = await axios.get(tokenURI);
          const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
          return {
            price,
            tokenId: tokenId.toNumber(),
            seller,
            owner,
            image: metadata.image || null,
            animation_url: metadata.animation_url || null, // Support audio
            name: metadata.name || 'Unnamed NFT',
            description: metadata.description || '',
            assetType: metadata.assetType || 'image', // Default to image if not specified
            tokenURI,
            i: tokenId.toNumber(), // Add i for fallback
          };
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
          return null;
        }
      }).filter(item => item !== null)
    );
    return items;
  };

  //   // Other functions (fetchMyNFTsOrListedNFTs, buyNft) remain unchanged for now but can be updated similarly if needed

  //   return (
  //     <NFTContext.Provider
  //       value={{
  //         nftCurrency,
  //         connectWallet,
  //         currentAccount,
  //         uploadToIPFS,
  //         createNFT,
  //         fetchNFTs,
  //         fetchMyNFTsOrListedNFTs,
  //         buyNft,
  //         createSale,
  //         isLoadingNFT,
  //       }}
  //     >
  //       {children}
  //     </NFTContext.Provider>
  //   );
  // };
  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data = type === 'fetchItemsListed'
      ? await contract.fetchItemsListed()
      : await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const { data: metadata } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          'ether',
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image: metadata.image || null,
          animation_url: metadata.animation_url || null,
          name: metadata.name || 'Unnamed NFT',
          description: metadata.description || '',
          assetType: metadata.assetType || 'image',
          tokenURI,
          i: tokenId.toNumber(), // Add i for fallback
        };
      }),
    );
    return items.filter((item) => item !== null);
  };

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketAddress,
      MarketAddressABI,
      signer,
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNft,
        createSale,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};