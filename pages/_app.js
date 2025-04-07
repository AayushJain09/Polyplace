import Script from 'next/script'; 
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import { useState } from 'react';
import { RiRobot3Fill } from "react-icons/ri";

import { Navbar, Footer, AIChat } from '../components';
import { NFTProvider } from '../context/NFTContext';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <NFTProvider>
            <ThemeProvider attribute="class">
                <div className="dark:bg-nft-dark bg-white min-h-screen">
                    <Head>
                        <title>PolyPlace -NFT Marketplace</title>
                        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    </Head>
                    <Navbar />
                    <div className="pt-65">
                        <Component {...pageProps} />
                    </div>
                    <Footer />

                    {/* Floating Chat Button */}
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}  // Toggle chat visibility
                        className="fixed bottom-10 right-10 w-16 h-16 text-3xl bg-nft-red-violet text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-600 z-50 transition-all duration-300"
                        aria-label="Toggle Chatbot"
                    >
                        {/* Show close icon (✕) when the chat is open, otherwise show robot icon */}
                        {isChatOpen ? '✕' : "🤖"}
                    </button>

                    {/* Chatbot Window */}
                    <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </div>

                <Script src="https://kit.fontawesome.com/77a74156e4.js" crossOrigin="anonymous" />
            </ThemeProvider>
        </NFTProvider>
    );
};

export default MyApp;
