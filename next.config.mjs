/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
            allowedOrigins: ['localhost:3000', '192.168.1.121:3000'],
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: false,
//     images: {
//         remotePatterns: [
//             {
//                 protocol: 'https',
//                 hostname: '**',
//                 port: '',
//             },
//         ]
//     },
//     experimental: {
//         serverActions: {
//             bodySizeLimit: '5mb',
//             serverActions: true,
//             allowedOrigins: ['localhost:3000/','https://anybet.site'],
//         },
//     },
// };
//
// export default nextConfig;
