/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    webpackDevMiddleware: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        };
        return config;
    },
    images: {
        domains: ['polyplace.infura-ipfs.io','tomato-recent-booby-737.mypinata.cloud','ipfs.infura.io','gateway.pinata.cloud','ipfs.io'],
    },
};

module.exports = nextConfig;
