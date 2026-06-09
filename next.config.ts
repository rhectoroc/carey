import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    async rewrites() {
        // En producción o desarrollo, redirige las llamadas /api al contenedor de la app backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        return [
            {
                source: "/api/:path*",
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
